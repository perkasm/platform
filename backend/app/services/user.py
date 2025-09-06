from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.auth.service import get_password_hash

# In-memory storage for users when database is not available
users_db = {}

def get_user(db: Session, user_id: int):
    if db is None:
        # Return from in-memory storage
        return users_db.get(user_id)
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    if db is None:
        # Return from in-memory storage
        for user in users_db.values():
            if user.email == email:
                return user
        return None
    return db.query(User).filter(User.email == email).first()

def get_user_by_google_id(db: Session, google_id: str):
    if db is None:
        # Return from in-memory storage
        for user in users_db.values():
            if getattr(user, 'google_id', None) == google_id:
                return user
        return None
    return db.query(User).filter(User.google_id == google_id).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    if db is None:
        # Return from in-memory storage
        return list(users_db.values())[skip:skip+limit]
    return db.query(User).offset(skip).limit(limit).all()

def create_user(db: Session, user: UserCreate):
    if db is None:
        # Create in in-memory storage
        user_dict = user.dict()
        user_dict['id'] = len(users_db) + 1
        user_dict['hashed_password'] = get_password_hash(user_dict.pop('password'))
        user_dict['is_active'] = True
        user_dict['is_superuser'] = False
        db_user = type('User', (), user_dict)()
        users_db[db_user.id] = db_user
        return db_user
    
    db_user = User(
        email=user.email,
        full_name=user.full_name,
        hashed_password=get_password_hash(user.password),
        is_active=True,
        is_superuser=False
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def create_user_from_google(db: Session, google_user_info: dict):
    if db is None:
        # Create in in-memory storage
        user_dict = {
            'id': len(users_db) + 1,
            'email': google_user_info.get("email"),
            'full_name': google_user_info.get("name"),
            'google_id': google_user_info.get("id"),
            'is_active': True,
            'is_superuser': False
        }
        db_user = type('User', (), user_dict)()
        users_db[db_user.id] = db_user
        return db_user
    
    db_user = User(
        email=google_user_info.get("email"),
        full_name=google_user_info.get("name"),
        google_id=google_user_info.get("id"),
        is_active=True,
        is_superuser=False
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, db_user: User, user_update: UserUpdate):
    if db is None:
        # Update in in-memory storage
        update_data = user_update.dict(exclude_unset=True)
        if "password" in update_data and update_data["password"]:
            update_data["hashed_password"] = get_password_hash(update_data["password"])
            del update_data["password"]
        
        for field, value in update_data.items():
            setattr(db_user, field, value)
        
        users_db[db_user.id] = db_user
        return db_user
    
    update_data = user_update.dict(exclude_unset=True)
    if "password" in update_data and update_data["password"]:
        update_data["hashed_password"] = get_password_hash(update_data["password"])
        del update_data["password"]
    
    for field, value in update_data.items():
        setattr(db_user, field, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user