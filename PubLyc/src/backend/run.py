from flask import Flask, jsonify, request, g
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime, timezone
from functools import wraps
from sqlalchemy import text

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///posts.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)


def utc_now():
    return datetime.now(timezone.utc)


class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text)
    author = db.Column(db.String(100), default="Администрация")
    author_id = db.Column(db.Integer, nullable=True)
    views = db.Column(db.Integer, default=0)
    likes = db.Column(db.Integer, default=0)
    comments = db.Column(db.Integer, default=0)
    category = db.Column(db.String(50), default="Мероприятие")
    created_at = db.Column(db.DateTime, default=utc_now)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'author': self.author,
            'author_id': self.author_id or 1,
            'icon': '👤',
            'views': self.views,
            'likes': self.likes,
            'comments': self.comments,
            'category': self.category,
            'date': self.created_at.isoformat() if self.created_at else None
        }


class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    avatar = db.Column(db.String(50), default='👤')
    status = db.Column(db.String(50), default='user')
    created_at = db.Column(db.DateTime, default=utc_now)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'avatar': self.avatar,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Subscription(db.Model):
    __tablename__ = 'subscriptions'
    id = db.Column(db.Integer, primary_key=True)
    subscriber_id = db.Column(db.Integer, nullable=False)
    author_id = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=utc_now)
    __table_args__ = (db.UniqueConstraint('subscriber_id', 'author_id'),)

    def to_dict(self):
        return {
            'id': self.id,
            'subscriber_id': self.subscriber_id,
            'author_id': self.author_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Chat(db.Model):
    __tablename__ = 'chats'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    last_message = db.Column(db.Text)


class Message(db.Model):
    __tablename__ = 'messages'

    __table_args__ = (
        db.Index('idx_chat_sent', 'chat_id', 'sent_at'),
        db.Index('idx_user_chat', 'user_id', 'chat_id'),
    )

    id = db.Column(db.Integer, primary_key=True)
    chat_id = db.Column(db.Integer, db.ForeignKey('chats.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    text = db.Column(db.Text, nullable=False)
    sent_at = db.Column(db.DateTime, default=utc_now, nullable=False)
    is_edited = db.Column(db.Boolean, default=False, nullable=False)

    chat = db.relationship('Chat', backref=db.backref('messages', lazy='select'))
    author = db.relationship('User', backref='sent_messages', foreign_keys=[user_id])

    def to_dict(self, current_user_id=None):
        return {
            'id': self.id,
            'side': 'right' if self.user_id == current_user_id else 'left',
            'user_id': self.user_id,
            'author': self.author.name if self.author else 'Unknown',
            'role': self.author.status if self.author else 'user',
            'text': self.text,
            'avatar': self.author.avatar if self.author else '👤',
            'sent_at': self.sent_at.isoformat() if self.sent_at else None,
            'is_edited': self.is_edited
        }


CURRENT_USER_ID = 1


def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        g.current_user_id = CURRENT_USER_ID
        return f(*args, **kwargs)
    return decorated_function


def chat_to_dict(chat):
    return {
        'id': chat.id,
        'title': chat.title,
        'last_message': chat.last_message
    }


def message_to_dict(msg):
    user = User.query.get(msg.user_id)
    return {
        'id': msg.id,
        'chat_id': msg.chat_id,
        'user_id': msg.user_id,
        'text': msg.text,
        'sent_at': msg.sent_at.isoformat() if msg.sent_at else None,
        'author': user.name if user else 'Unknown'
    }


@app.route('/api/chats', methods=['GET'])
@login_required
def get_chats():
    try:
        chats = Chat.query.order_by(Chat.id.asc()).all()
        return jsonify([chat_to_dict(c) for c in chats])
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/chats/<int:chat_id>', methods=['GET'])
@login_required
def get_chat(chat_id):
    try:
        chat = Chat.query.get(chat_id)
        if not chat:
            return jsonify({'error': 'Чат не найден'}), 404

        messages = Message.query.filter_by(chat_id=chat_id) \
            .order_by(Message.sent_at.asc()) \
            .limit(50).all()

        return jsonify({
            'chat': chat_to_dict(chat),
            'messages': [m.to_dict() for m in messages]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/chats', methods=['POST'])
@login_required
def create_chat():
    try:
        data = request.get_json()
        if not data or not data.get('title'):
            return jsonify({'error': 'Требуется поле "title"'}), 400

        new_chat = Chat(title=data['title'].strip(), last_message=None)
        db.session.add(new_chat)
        db.session.commit()

        return jsonify({'message': 'Чат создан', 'chat': chat_to_dict(new_chat)}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/users/<int:user_id>/chats', methods=['GET'])
def get_user_chats(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'Пользователь не найден'}), 404

        user_chat_ids = db.session.query(Message.chat_id) \
            .filter(Message.user_id == user_id) \
            .distinct() \
            .all()
        chat_ids = [c[0] for c in user_chat_ids]

        chats = Chat.query.filter(Chat.id.in_(chat_ids)).all() if chat_ids else []

        result = []
        for chat in chats:
            msg_count = Message.query.filter_by(chat_id=chat.id, user_id=user_id).count()

            last_msg = Message.query.filter_by(chat_id=chat.id, user_id=user_id) \
                .order_by(Message.sent_at.desc()).first()
            last_msg_time = last_msg.sent_at.isoformat() if last_msg and last_msg.sent_at else None

            result.append({
                'chat': chat_to_dict(chat),
                'user_message_count': msg_count,
                'last_user_message_at': last_msg_time
            })

        return jsonify({
            'user_id': user_id,
            'total_chats': len(result),
            'chats': result
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/chats/<int:chat_id>/messages', methods=['POST'])
@login_required
def send_message(chat_id):
    try:
        chat = Chat.query.get(chat_id)
        if not chat:
            return jsonify({'error': 'Чат не найден'}), 404

        data = request.get_json()
        if not data or not data.get('text'):
            return jsonify({'error': 'Требуется поле "text"'}), 400

        text = data['text'].strip()
        if len(text) == 0 or len(text) > 5000:
            return jsonify({'error': 'Сообщение должно содержать от 1 до 5000 символов'}), 400

        new_msg = Message(
            chat_id=chat_id,
            user_id=g.current_user_id,
            text=text
        )

        chat.last_message = text[:100] + '...' if len(text) > 100 else text
        db.session.add(new_msg)
        db.session.commit()

        return jsonify({
            'message': 'Сообщение отправлено',
            'message_data': message_to_dict(new_msg)
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Внутренняя ошибка сервера'}), 500


@app.route('/api/users/<int:user_id>/chats/<int:chat_id>/messages', methods=['DELETE'])
@login_required
def delete_user_messages_in_chat(user_id, chat_id):
    try:
        if user_id != g.current_user_id:
            return jsonify({'error': 'Нет прав для удаления чужих сообщений'}), 403

        chat = Chat.query.get(chat_id)
        if not chat:
            return jsonify({'error': 'Чат не найден'}), 404

        deleted_count = Message.query.filter_by(
            chat_id=chat_id,
            user_id=user_id
        ).delete(synchronize_session=False)

        db.session.commit()

        return jsonify({
            'message': f'Удалено {deleted_count} сообщений',
            'deleted_count': deleted_count
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/subscriptions', methods=['POST'])
@login_required
def create_subscription():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Нет данных'}), 400

        author_id = data.get('author_id')
        if not author_id:
            return jsonify({'error': 'Не указан author_id'}), 400

        if author_id == CURRENT_USER_ID:
            return jsonify({'error': 'Нельзя подписаться на самого себя'}), 400

        author = User.query.get(author_id)
        if not author:
            return jsonify({'error': 'Автор не найден'}), 404

        existing = Subscription.query.filter_by(
            subscriber_id=CURRENT_USER_ID,
            author_id=author_id
        ).first()

        subscription = Subscription(
            subscriber_id=CURRENT_USER_ID,
            author_id=author_id
        )

        db.session.add(subscription)
        db.session.commit()

        return jsonify({
            'message': 'Подписка оформлена успешно',
            'subscription': subscription.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/subscriptions', methods=['GET'])
@login_required
def get_my_subscriptions():
    try:
        subscriptions = Subscription.query.filter_by(subscriber_id=CURRENT_USER_ID).all()
        result = []
        for sub in subscriptions:
            author = User.query.get(sub.author_id)
            result.append({
                'id': sub.id,
                'author': author.to_dict() if author else None,
                'created_at': sub.created_at.isoformat() if sub.created_at else None
            })
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/users/<int:user_id>/subscriptions', methods=['GET'])
def get_user_subscriptions(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'Пользователь не найден'}), 404

        subscriptions = Subscription.query.filter_by(subscriber_id=user_id).all()
        result = []
        for sub in subscriptions:
            author = User.query.get(sub.author_id)
            result.append(author.id)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/users/<int:user_id>/subscribers', methods=['GET'])
def get_user_subscribers(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'Пользователь не найден'}), 404

        subscribers = Subscription.query.filter_by(author_id=user_id).all()
        result = []
        for sub in subscribers:
            subscriber = User.query.get(sub.subscriber_id)
            result.append({
                'id': sub.id,
                'subscriber': subscriber.to_dict() if subscriber else None,
                'created_at': sub.created_at.isoformat() if sub.created_at else None
            })
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/subscriptions/<int:subscription_id>', methods=['DELETE'])
@login_required
def delete_subscription(subscription_id):
    try:
        subscription = Subscription.query.get(subscription_id)
        if not subscription:
            return jsonify({'error': 'Подписка не найдена'}), 404

        if subscription.subscriber_id != CURRENT_USER_ID:
            return jsonify({'error': 'Нет прав для удаления этой подписки'}), 403

        db.session.delete(subscription)
        db.session.commit()
        return jsonify({'message': 'Подписка удалена успешно'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/subscriptions/unsubscribe/<int:author_id>', methods=['DELETE'])
@login_required
def unsubscribe_from_author(author_id):
    try:
        subscription = Subscription.query.filter_by(
            subscriber_id=CURRENT_USER_ID,
            author_id=author_id
        ).first()

        if not subscription:
            return jsonify({'error': 'Подписка не найдена'}), 404

        db.session.delete(subscription)
        db.session.commit()
        return jsonify({'message': 'Подписка удалена успешно'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/posts', methods=['GET'])
def get_posts():
    try:
        posts = Post.query.order_by(Post.created_at.desc()).all()
        return jsonify([p.to_dict() for p in posts])
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/users', methods=['GET'])
def get_users():
    try:
        users = User.query.all()
        return jsonify([u.to_dict() for u in users])
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'Пользователь не найден'}), 404
        return jsonify(user.to_dict())
    except Exception as e:
        return jsonify({'error': str(e)}), 500


with app.app_context():
    db.drop_all()
    db.create_all()

    if app.config['SQLALCHEMY_DATABASE_URI'].startswith('sqlite'):
        try:
            db.session.execute(text("DELETE FROM sqlite_sequence"))
            db.session.commit()
        except Exception:
            pass

    if User.query.count() == 0:
        test_users = [
            User(id=1, name='Aspas', email='admin@example.com',
                 password_hash='hash1', avatar='👨‍💼', status='admin'),
            User(id=2, name='Иван Петров', email='ivan@example.com',
                 password_hash='hash2', avatar='👨', status='user'),
            User(id=3, name='Мария Сидорова', email='maria@example.com',
                 password_hash='hash3', avatar='👩', status='user'),
            User(id=4, name='YTy', email='yty@example.com',
                 password_hash='hash4', avatar='🎮', status='user'),
        ]
        db.session.add_all(test_users)
        db.session.commit()

    if Post.query.count() == 0:
        test_posts = [
            Post(title='ДОД 2026', description='Описание есть......',
                 views=1, likes=15, comments=10,
                 author='Администратор', author_id=3,
                 created_at=datetime(2026, 12, 15)),
            Post(title='ДОД 2026 #2', description='Второй тестовый пост',
                 views=100, likes=42, comments=8,
                 author='Администратор', author_id=3,
                 created_at=datetime(2026, 11, 10)),
            Post(title='Старый пост 2023', description='Описание fsfsf.',
                 views=90, likes=15, comments=10,
                 author='YTy', author_id=4,
                 created_at=datetime(2023, 3, 15)),
        ]
        db.session.add_all(test_posts)
        db.session.commit()

    if Chat.query.count() == 0:
        test_chats = [
            Chat(id=1, title='Приют для собак', last_message='координаторы/волонтеры...'),
            Chat(id=2, title='Приют для кошек', last_message='Нужны корма!'),
            Chat(id=3, title='Приют для черепах', last_message='Встреча в субботу'),
        ]
        db.session.add_all(test_chats)
        db.session.commit()

    if Message.query.count() == 0:
        test_messages = [
            Message(chat_id=1, user_id=1, text='Привет! Кто сегодня дежурит?',
                    sent_at=datetime(2024, 1, 15, 10, 0)),
            Message(chat_id=1, user_id=2, text='Я могу с 14:00 до 18:00',
                    sent_at=datetime(2024, 1, 15, 10, 5)),
            Message(chat_id=1, user_id=3, text='Отлично, спасибо!',
                    sent_at=datetime(2024, 1, 15, 10, 10)),
            Message(chat_id=2, user_id=4, text='Заканчивается сухой корм для котят',
                    sent_at=datetime(2024, 1, 16, 9, 0)),
            Message(chat_id=2, user_id=1, text='Закажу сегодня вечером',
                    sent_at=datetime(2024, 1, 16, 9, 30)),
        ]
        db.session.add_all(test_messages)
        db.session.commit()

    if Subscription.query.count() == 0:
        test_subscriptions = [
            Subscription(subscriber_id=2, author_id=1),
            Subscription(subscriber_id=3, author_id=1),
            Subscription(subscriber_id=2, author_id=4),
        ]
        db.session.add_all(test_subscriptions)
        db.session.commit()


if __name__ == '__main__':
    app.run(debug=True, port=5000)