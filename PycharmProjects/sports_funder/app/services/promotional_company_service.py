"""
Promotional Company Integration Service
Handles order forwarding, status updates, and API integration with promotional companies
"""

import asyncio
import json
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.models.order_management import (
    Order, PromotionalCompanyOrder, OrderStatus, OrderStatusUpdate
)
from app.models.commerce import PromotionalCompany
from app.services.communication_service import CommunicationService

logger = logging.getLogger(__name__)


class PromotionalCompanyService:
    """Service for handling promotional company integrations"""
    
    def __init__(self, db: Session):
        self.db = db
        self.communication_service = CommunicationService(db)
    
    async def forward_order_to_company(self, order_id: int) -> Dict[str, Any]:
        """Forward order to appropriate promotional company"""
        try:
            order = self.db.query(Order).filter(Order.id == order_id).first()
            if not order:
                return {"success": False, "error": "Order not found"}
            
            # Determine which promotional company to use
            company = await self._get_promotional_company_for_order(order)
            if not company:
                return {"success": False, "error": "No promotional company available for this order"}
            
            # Prepare order data for company API
            order_data = await self._prepare_order_data(order)
            
            # Send to promotional company
            api_response = await self._send_order_to_company(company, order_data)
            
            if api_response.get("success"):
                # Create promotional company order record
                company_order = PromotionalCompanyOrder(
                    order_id=order_id,
                    promotional_company_id=company.id,
                    company_order_id=api_response.get("order_id"),
                    company_reference=api_response.get("reference"),
                    status="confirmed",
                    api_request_data=order_data,
                    api_response_data=api_response,
                    api_last_sync=datetime.utcnow()
                )
                
                self.db.add(company_order)
                
                # Update main order
                order.promotional_company_id = company.id
                order.company_order_reference = api_response.get("reference")
                order.status = OrderStatus.CONFIRMED
                
                # Create status update
                status_update = OrderStatusUpdate(
                    order_id=order_id,
                    new_status=OrderStatus.CONFIRMED,
                    status_message=f"Order forwarded to {company.name}",
                    tracking_number=api_response.get("tracking_number"),
                    carrier=api_response.get("carrier")
                )
                
                self.db.add(status_update)
                self.db.commit()
                
                # Send confirmation to customer
                await self.communication_service.send_order_confirmation(order_id)
                
                return {
                    "success": True,
                    "company_name": company.name,
                    "company_order_id": api_response.get("order_id"),
                    "tracking_number": api_response.get("tracking_number")
                }
            else:
                # Log failed attempt
                company_order = PromotionalCompanyOrder(
                    order_id=order_id,
                    promotional_company_id=company.id,
                    status="failed",
                    api_request_data=order_data,
                    api_response_data=api_response,
                    api_last_sync=datetime.utcnow()
                )
                
                self.db.add(company_order)
                self.db.commit()
                
                return {
                    "success": False,
                    "error": api_response.get("error", "Failed to forward order to promotional company")
                }
                
        except Exception as e:
            logger.error(f"Error forwarding order {order_id} to promotional company: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def sync_order_status(self, order_id: int) -> Dict[str, Any]:
        """Sync order status from promotional company"""
        try:
            company_order = self.db.query(PromotionalCompanyOrder).filter(
                PromotionalCompanyOrder.order_id == order_id
            ).first()
            
            if not company_order:
                return {"success": False, "error": "No promotional company order found"}
            
            company = self.db.query(PromotionalCompany).filter(
                PromotionalCompany.id == company_order.promotional_company_id
            ).first()
            
            if not company:
                return {"success": False, "error": "Promotional company not found"}
            
            # Get status from company API
            status_response = await self._get_order_status_from_company(company, company_order.company_order_id)
            
            if status_response.get("success"):
                new_status = status_response.get("status")
                tracking_number = status_response.get("tracking_number")
                carrier = status_response.get("carrier")
                
                # Update company order
                company_order.status = new_status
                company_order.company_status = status_response.get("status_message")
                company_order.api_last_sync = datetime.utcnow()
                
                # Update main order if status changed
                order = self.db.query(Order).filter(Order.id == order_id).first()
                if order and order.status.value != new_status:
                    previous_status = order.status
                    order.status = OrderStatus(new_status)
                    
                    # Update tracking info
                    if tracking_number:
                        order.company_tracking_number = tracking_number
                    
                    # Create status update
                    status_update = OrderStatusUpdate(
                        order_id=order_id,
                        previous_status=previous_status,
                        new_status=order.status,
                        status_message=status_response.get("status_message"),
                        tracking_number=tracking_number,
                        carrier=carrier
                    )
                    
                    self.db.add(status_update)
                    
                    # Send status update to customer
                    await self.communication_service.send_order_status_update(
                        order_id, order.status, tracking_number, carrier
                    )
                
                self.db.commit()
                
                return {
                    "success": True,
                    "status": new_status,
                    "tracking_number": tracking_number,
                    "carrier": carrier
                }
            else:
                return {
                    "success": False,
                    "error": status_response.get("error", "Failed to sync status")
                }
                
        except Exception as e:
            logger.error(f"Error syncing order status for order {order_id}: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def bulk_sync_orders(self, school_id: int = None, company_id: int = None) -> Dict[str, Any]:
        """Bulk sync order statuses for multiple orders"""
        try:
            # Get orders to sync
            query = self.db.query(PromotionalCompanyOrder).filter(
                PromotionalCompanyOrder.status.in_(["confirmed", "processing", "shipped"])
            )
            
            if school_id:
                query = query.join(Order).filter(Order.school_id == school_id)
            
            if company_id:
                query = query.filter(PromotionalCompanyOrder.promotional_company_id == company_id)
            
            company_orders = query.all()
            
            if not company_orders:
                return {"success": True, "message": "No orders to sync"}
            
            successful_syncs = 0
            failed_syncs = 0
            
            for company_order in company_orders:
                try:
                    result = await self.sync_order_status(company_order.order_id)
                    if result.get("success"):
                        successful_syncs += 1
                    else:
                        failed_syncs += 1
                except Exception as e:
                    logger.error(f"Error syncing order {company_order.order_id}: {str(e)}")
                    failed_syncs += 1
            
            return {
                "success": True,
                "total_orders": len(company_orders),
                "successful_syncs": successful_syncs,
                "failed_syncs": failed_syncs
            }
            
        except Exception as e:
            logger.error(f"Error in bulk sync: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def _get_promotional_company_for_order(self, order: Order) -> Optional[PromotionalCompany]:
        """Determine which promotional company should handle this order"""
        try:
            # Check if order already has a company assigned
            if order.promotional_company_id:
                return self.db.query(PromotionalCompany).filter(
                    PromotionalCompany.id == order.promotional_company_id
                ).first()
            
            # Find companies that serve this school
            companies = self.db.query(PromotionalCompany).filter(
                and_(
                    PromotionalCompany.is_active == True,
                    or_(
                        PromotionalCompany.access_all_schools == True,
                        PromotionalCompany.allowed_schools.contains([order.school_id])
                    )
                )
            ).all()
            
            if not companies:
                return None
            
            # For now, return the first available company
            # TODO: Implement load balancing or preference logic
            return companies[0]
            
        except Exception as e:
            logger.error(f"Error getting promotional company for order: {str(e)}")
            return None
    
    async def _prepare_order_data(self, order: Order) -> Dict[str, Any]:
        """Prepare order data for promotional company API"""
        return {
            "order_number": order.order_number,
            "customer": {
                "name": order.customer_name,
                "email": order.customer_email,
                "phone": order.customer_phone,
                "shipping_address": order.shipping_address,
                "billing_address": order.billing_address
            },
            "items": [
                {
                    "product_name": item.product_name,
                    "product_sku": item.product_sku,
                    "quantity": item.quantity,
                    "unit_price": float(item.unit_price),
                    "total_price": float(item.total_price),
                    "size": item.size,
                    "color": item.color,
                    "customization": item.customization_options
                }
                for item in order.order_items
            ],
            "totals": {
                "subtotal": float(order.subtotal),
                "tax": float(order.tax_amount),
                "shipping": float(order.shipping_cost),
                "total": float(order.total_amount)
            },
            "school": {
                "id": order.school_id,
                "name": order.school.name if order.school else None
            },
            "team": {
                "id": order.team_id,
                "name": order.team.name if order.team else None
            },
            "order_date": order.created_at.isoformat(),
            "notes": order.notes
        }
    
    async def _send_order_to_company(self, company: PromotionalCompany, order_data: Dict[str, Any]) -> Dict[str, Any]:
        """Send order to promotional company via API"""
        try:
            if not company.api_endpoint:
                return {"success": False, "error": "Company API endpoint not configured"}
            
            # TODO: Implement actual API call to promotional company
            # This would use the company's API endpoint, authentication, and format
            
            # For now, simulate API response
            import random
            success = random.choice([True, True, True, False])  # 75% success rate for demo
            
            if success:
                return {
                    "success": True,
                    "order_id": f"COMP_{company.id}_{order_data['order_number']}",
                    "reference": f"REF_{order_data['order_number']}",
                    "tracking_number": f"TRK{random.randint(100000, 999999)}",
                    "carrier": random.choice(["UPS", "FedEx", "USPS"]),
                    "estimated_delivery": (datetime.utcnow() + timedelta(days=random.randint(3, 7))).isoformat()
                }
            else:
                return {
                    "success": False,
                    "error": "Company API temporarily unavailable"
                }
                
        except Exception as e:
            logger.error(f"Error sending order to company {company.name}: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def _get_order_status_from_company(self, company: PromotionalCompany, company_order_id: str) -> Dict[str, Any]:
        """Get order status from promotional company API"""
        try:
            if not company.api_endpoint:
                return {"success": False, "error": "Company API endpoint not configured"}
            
            # TODO: Implement actual API call to get status
            # This would query the company's API for order status
            
            # For now, simulate status response
            import random
            statuses = ["confirmed", "processing", "shipped", "delivered"]
            current_status = random.choice(statuses)
            
            return {
                "success": True,
                "status": current_status,
                "status_message": f"Order is {current_status}",
                "tracking_number": f"TRK{random.randint(100000, 999999)}" if current_status in ["shipped", "delivered"] else None,
                "carrier": random.choice(["UPS", "FedEx", "USPS"]) if current_status in ["shipped", "delivered"] else None,
                "last_updated": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting status from company {company.name}: {str(e)}")
            return {"success": False, "error": str(e)}


# Import timedelta
from datetime import timedelta
