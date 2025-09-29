"""
Main API router that includes all endpoint routers.
"""
from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, schools, coaches, players, products, businesses, notifications, ai, api_keys, dashboards, dashboard_data, schema_management, product_import, ecommerce, communication
# Temporarily disabled due to Pydantic/SQLAlchemy enum conflicts:
# from app.api.v1.endpoints import payments, agreements
# from app.api.v1.endpoints import orders  # Temporarily disabled due to table conflicts
# from app.api.v1.endpoints import promotional_companies, local_sponsors, communication

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(schools.router, prefix="/schools", tags=["schools"])
api_router.include_router(coaches.router, prefix="/coaches", tags=["coaches"])
api_router.include_router(players.router, prefix="/players", tags=["players"])
# api_router.include_router(orders.router, prefix="/orders", tags=["orders"])  # Temporarily disabled
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(businesses.router, prefix="/businesses", tags=["businesses"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai-assistant"])
api_router.include_router(api_keys.router, prefix="/api-keys", tags=["api-keys-management"])
# api_router.include_router(partners.router, prefix="/partners", tags=["partner-management"])
# api_router.include_router(local_business.router, prefix="/local", tags=["local-business-directory"])
api_router.include_router(dashboards.router, prefix="/dashboards", tags=["dashboards"])
api_router.include_router(dashboard_data.router, prefix="/dashboard-data", tags=["dashboard-data"])
api_router.include_router(product_import.router, prefix="/product-import", tags=["product-import"])
api_router.include_router(schema_management.router, prefix="/schema", tags=["schema-management"])
# api_router.include_router(promotional_companies.router, prefix="/promotional-companies", tags=["promotional-companies"])
# api_router.include_router(local_sponsors.router, prefix="/local-sponsors", tags=["local-sponsors"])
# api_router.include_router(payments.router, prefix="/payments", tags=["payments"])  # Temporarily disabled
# api_router.include_router(agreements.router, prefix="/agreements", tags=["agreements"])  # Temporarily disabled
api_router.include_router(ecommerce.router, prefix="/ecommerce", tags=["ecommerce"])
api_router.include_router(communication.router, prefix="/communication", tags=["communication"])
# api_router.include_router(theme_editor.router, prefix="/theme-editor", tags=["theme-editor"])


