"""
Main Flask Application for Client Portal with ELD Integration
"""

import os
import logging
from flask import Flask, render_template, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import blueprints
from rapid_eld import eld_blueprint

def create_app():
    """Application factory pattern"""
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    app.config['DEBUG'] = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    
    # Enable CORS for API endpoints
    CORS(app, origins=os.environ.get('ALLOWED_ORIGINS', '*').split(','))
    
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s %(levelname)s %(name)s %(message)s'
    )
    
    # Register blueprints
    app.register_blueprint(eld_blueprint)
    
    # Health check endpoint
    @app.route('/health')
    def health_check():
        return jsonify({
            'status': 'healthy',
            'service': 'client-portal-eld',
            'version': '1.0.0'
        }), 200
    
    # Main dashboard route
    @app.route('/')
    def dashboard():
        return render_template('dashboard.html')
    
    # ELD dashboard route
    @app.route('/eld')
    def eld_dashboard():
        return render_template('eld_dashboard.html')
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(
        host=os.environ.get('HOST', '0.0.0.0'),
        port=int(os.environ.get('PORT', 5000)),
        debug=app.config['DEBUG']
    )
