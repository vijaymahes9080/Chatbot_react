from sqlalchemy import Column, String, Integer, JSON, Boolean
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="member")  # admin, member
    is_active = Column(Boolean, default=True)
    
    # Custom API Keys configurability
    api_keys_config = Column(JSON, default=dict)
