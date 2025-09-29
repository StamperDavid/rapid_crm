"""
Main FastAPI application entry point.
"""
from fastapi import FastAPI, Request, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
import time
import logging
from contextlib import asynccontextmanager

from app.core.config_simple import settings
from app.core.database import engine, Base
from app.api.v1.api import api_router

# Configure basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    logger.info(f"Starting Sports Funder application version {settings.APP_VERSION}")
    
    # Create database tables
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created/verified")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Sports Funder application")


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Enterprise-level sports funding platform with QR code onboarding, AI assistance, and comprehensive sales tracking",
    openapi_url="/api/v1/openapi.json" if settings.DEBUG else None,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add trusted host middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"]  # Allow all hosts for development
)

# Add request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all HTTP requests."""
    start_time = time.time()
    
    # Log request
    logger.info(f"Request started: {request.method} {request.url}")
    
    # Process request
    response = await call_next(request)
    
    # Log response
    process_time = time.time() - start_time
    logger.info(f"Request completed: {request.method} {request.url} - {response.status_code} ({process_time:.3f}s)")
    
    return response


# Include API routes
app.include_router(api_router, prefix="/api/v1")


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "timestamp": time.time()
    }


# Root endpoint
@app.get("/")
async def root():
    """Serve the main landing page."""
    return FileResponse("app/static/index.html")


# API Keys Management Page
@app.get("/api-keys")
async def api_keys_management():
    """Serve the API keys management page."""
    return FileResponse("app/static/api-keys.html")


# Team Landing Page
@app.get("/team/{team_id}")
async def team_landing_page(team_id: int):
    """Serve the team landing page."""
    return FileResponse("app/static/team_landing.html")


# Business Detail Page
@app.get("/business/{business_id}")
async def business_detail_page(business_id: int):
    """Serve the business detail page."""
    return FileResponse("app/static/business_detail.html")


# Dashboard Pages
@app.get("/dashboard")
async def main_dashboard():
    """Serve the main dashboard page."""
    return FileResponse("app/static/dashboard.html")


@app.get("/dashboard/sales-agent")
async def sales_agent_dashboard():
    """Serve the sales agent dashboard."""
    return FileResponse("app/static/sales_agent_dashboard.html")


@app.get("/dashboard/sales-manager")
async def sales_manager_dashboard():
    """Serve the sales manager dashboard."""
    return FileResponse("app/static/dashboard.html")  # Will use same template with different data


@app.get("/dashboard/school/{school_id}")
async def school_dashboard(school_id: int):
    """Serve the school dashboard."""
    return FileResponse("app/static/school_dashboard.html")


@app.get("/dashboard/coach/{coach_id}")
async def coach_dashboard(coach_id: int):
    """Serve the coach dashboard."""
    return FileResponse("app/static/coach_dashboard.html")


@app.get("/dashboard/company")
async def company_dashboard():
    """Serve the company/supervisor dashboard."""
    return FileResponse("app/static/company_dashboard.html")


@app.get("/dashboard/supervisor")
async def supervisor_dashboard():
    """Serve the supervisor dashboard (alias for company dashboard)."""
    return FileResponse("app/static/company_dashboard.html")


@app.get("/profile")
async def profile_page():
    """Serve the user profile page."""
    return FileResponse("app/static/profile.html")


@app.get("/schools")
async def schools_page():
    """Serve the schools management page."""
    return FileResponse("app/static/schools.html")


@app.get("/school/{school_id}")
async def school_dashboard(school_id: int):
    """Serve the school dashboard page."""
    return FileResponse("app/static/school_dashboard.html")


@app.get("/coach/{coach_id}")
async def coach_dashboard(coach_id: int):
    """Serve the coach dashboard page."""
    return FileResponse("app/static/coach_dashboard.html")


@app.get("/player/{player_id}")
async def player_landing_page(player_id: int):
    """Serve the public player landing page for supporters."""
    return FileResponse("app/static/player_landing.html")


@app.get("/admin")
async def admin_page():
    """Serve the schema management admin page."""
    return FileResponse("app/static/admin.html")


@app.get("/product-import")
async def product_import_page():
    """Serve the product import management page."""
    return FileResponse("app/static/product_import.html")


@app.get("/promotional-companies")
async def promotional_companies_page():
    """Serve the promotional companies management page."""
    return FileResponse("app/static/promotional_companies.html")


@app.get("/local-sponsors")
async def local_sponsors_page():
    """Serve the local business sponsors management page."""
    return FileResponse("app/static/local_sponsors.html")

@app.get("/school-theme-customizer")
async def school_theme_customizer_page():
    """Serve the school theme customizer page."""
    return FileResponse("app/static/school_theme_customizer.html")

@app.get("/school-theme-customizer/{school_id}")
async def school_theme_customizer_for_school(school_id: int):
    """Serve the school theme customizer page for a specific school."""
    return FileResponse("app/static/school_theme_customizer.html")

@app.get("/theme-editor/{school_id}")
async def comprehensive_theme_editor(school_id: int):
    """Serve the comprehensive theme editor for a specific school."""
    return FileResponse("app/static/comprehensive_theme_editor.html")

@app.get("/theme-editor/{school_id}/mobile")
async def mobile_theme_editor(school_id: int):
    """Serve the mobile-optimized theme editor for a specific school."""
    return FileResponse("app/static/mobile_theme_editor.html")

@app.get("/admin-theme-editor")
async def admin_theme_editor_page():
    """Serve the admin theme editor page."""
    return FileResponse("app/static/admin_theme_editor.html")

@app.get("/supporter/{team_id}")
async def supporter_landing_page(team_id: int):
    """Serve the supporter landing page for a team."""
    return FileResponse("app/static/supporter_landing.html")


@app.get("/team-landing")
async def team_landing_page():
    """Serve the team landing page."""
    return FileResponse("app/static/team-landing.html")


@app.get("/team-landing.html")
async def team_landing_page_html():
    """Serve the team landing page (with .html extension)."""
    return FileResponse("app/static/team-landing.html")


@app.get("/team-store")
async def team_store_page():
    """Serve the team store page."""
    return FileResponse("app/static/team-store.html")


@app.get("/team-store.html")
async def team_store_page_html():
    """Serve the team store page (with .html extension)."""
    return FileResponse("app/static/team-store.html")


@app.get("/product-catalog")
async def product_catalog_page():
    """Serve the product catalog page."""
    return FileResponse("app/static/product-catalog.html")


@app.get("/shopping-cart")
async def shopping_cart_page():
    """Serve the shopping cart page."""
    return FileResponse("app/static/shopping-cart.html")


@app.get("/checkout")
async def checkout_page():
    """Serve the checkout page."""
    return FileResponse("app/static/checkout.html")


@app.get("/order-confirmation")
async def order_confirmation_page():
    """Serve the order confirmation page."""
    return FileResponse("app/static/order-confirmation.html")


@app.get("/communication-manager")
async def communication_manager_page():
    """Serve the communication manager page."""
    return FileResponse("app/static/communication-manager.html")


# Chat WebSocket endpoint
@app.websocket("/ws/chat/{team_id}")
async def websocket_chat_endpoint(websocket: WebSocket, team_id: int, user_id: int = None, token: str = None):
    """WebSocket endpoint for team chat"""
    from app.api.v1.endpoints.chat import websocket_chat_endpoint as chat_endpoint
    await chat_endpoint(websocket, team_id, user_id, token)


# Favicon
@app.get("/favicon.ico")
async def favicon():
    """Serve the favicon."""
    return FileResponse("app/static/favicon.ico")


# Mount static files (must be after all routes)
app.mount("/static", StaticFiles(directory="app/static"), name="static")


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler for unhandled errors."""
    logger.error(f"Unhandled exception: {str(exc)} - {request.method} {request.url}", exc_info=True)
    
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "error_id": "internal_error"
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="info"
    )

