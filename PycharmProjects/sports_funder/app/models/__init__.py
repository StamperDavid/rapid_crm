"""
Import all models to ensure they are registered with SQLAlchemy
"""

from .base import Base
from .user import User, SalesAgent, Coach, Player, SchoolAdmin
from .organization import School, Team, Business
from .commerce import Product, Order, OrderItem, Payment, TeamStore, TeamProduct, TeamOrder, TeamOrderItem, PromotionalCompany, ProductImage
from .notification import Notification, NotificationTemplate
from .api_keys import ApiKey, ApiKeyUsage
from .partner_system import (
    Territory, Partner, PartnerApiIntegration, PartnerOrder, 
    RegionalSettings, PartnerPerformanceMetrics, Lead, ServiceArea
)
# from .order_management import (
#     OrderStatus, CommunicationType, MessagePriority, Order as OrderManagement,
#     OrderItem as OrderItemManagement, OrderStatusUpdate, OrderCommunication,
#     MassCommunication, CommunicationLog, ContactList, PromotionalCompanyOrder
# )
from .communication import (
    CommunicationType, CommunicationChannel, CommunicationStatus,
    CommunicationTemplate, Communication, Game, CommunicationPreference, CommunicationLog
)
# from .commerce import PromotionalCompany, ProductImage  # Moved to avoid conflicts
from .product_import import (
    ProductImportSource, ProductImport, ImportedProduct, ProductTemplate,
    SchoolProduct, ProductFieldMapping
)
from .theme import Theme, ThemeComponent, ThemeSetting
from .payment import (
    PaymentTransaction, PaymentRefund, PaymentMethod, Subscription, 
    PaymentGateway, PaymentWebhook, PaymentStatus, PaymentMethod as PaymentMethodEnum,
    TransactionType
)
from .agreements import (
    Agreement, OrderAgreement, RevenueShare, ComplianceRecord,
    TransparencyReport, AgreementTemplate, AgreementAmendment,
    AgreementStatus, AgreementType, PaymentTerms
)
from .ecommerce import (
    ProductCategory, ProductVariant, Product as EcommerceProduct, ShoppingCart, CartItem,
    Order as EcommerceOrder, OrderItem, ProductReview, Wishlist, WishlistItem, Coupon,
    InventoryTransaction, OrderStatus as EcommerceOrderStatus
)

# Export all models
__all__ = [
    'Base',
    'User', 'SalesAgent', 'Coach', 'Player', 'SchoolAdmin',
    'School', 'Team', 'Business',
    'Product', 'Order', 'OrderItem', 'Payment', 'TeamStore', 'TeamProduct', 'TeamOrder', 'TeamOrderItem', 'PromotionalCompany', 'ProductImage',
    'Notification', 'NotificationTemplate',
    'ApiKey', 'ApiKeyUsage',
    'Territory', 'Partner', 'PartnerApiIntegration', 'PartnerOrder',
    'RegionalSettings', 'PartnerPerformanceMetrics', 'Lead', 'ServiceArea',
    # 'OrderStatus', 'CommunicationType', 'MessagePriority', 'OrderManagement',
    # 'OrderItemManagement', 'OrderStatusUpdate', 'OrderCommunication',
    # 'MassCommunication', 'CommunicationLog', 'ContactList', 'PromotionalCompanyOrder',
    'CommunicationType', 'CommunicationChannel', 'CommunicationStatus',
    'CommunicationTemplate', 'Communication', 'Game', 'CommunicationPreference', 'CommunicationLog',
    # 'PromotionalCompany', 'ProductImage',  # Moved to avoid conflicts
    'ProductImportSource', 'ProductImport', 'ImportedProduct', 'ProductTemplate',
    'SchoolProduct', 'ProductFieldMapping',
    'Theme', 'ThemeComponent', 'ThemeSetting',
    'PaymentTransaction', 'PaymentRefund', 'PaymentMethod', 'Subscription',
    'PaymentGateway', 'PaymentWebhook', 'PaymentStatus', 'PaymentMethodEnum',
    'TransactionType',
    'Agreement', 'OrderAgreement', 'RevenueShare', 'ComplianceRecord',
    'TransparencyReport', 'AgreementTemplate', 'AgreementAmendment',
    'AgreementStatus', 'AgreementType', 'PaymentTerms',
    'ProductCategory', 'ProductVariant', 'EcommerceProduct', 'ShoppingCart', 'CartItem',
    'EcommerceOrder', 'OrderItem', 'ProductReview', 'Wishlist', 'WishlistItem', 'Coupon',
    'InventoryTransaction', 'EcommerceOrderStatus'
]