from flask import Flask
from config import Config
from extensions import db
from flask_cors import CORS


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app, origins=["http://localhost:5174"], supports_credentials=True)
    # Привязываем SQLAlchemy к приложению
    db.init_app(app)

    # Здесь позже добавите Blueprint'ы:
    # from routes import auth, posts
    # app.register_blueprint(auth.bp, url_prefix='/api/auth')

    return app