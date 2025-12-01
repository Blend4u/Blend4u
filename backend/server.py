from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'blend4u-super-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 720  # 30 days

# Security
security = HTTPBearer()

# Create the main app
app = FastAPI(title="Blend4u API")
api_router = APIRouter(prefix="/api")

# ============= ENUMS =============
class UserRole(str, Enum):
    USER = "USER"
    ADMIN = "ADMIN"

class OrderStatus(str, Enum):
    PENDING = "PENDING"
    PAID = "PAID"
    PROCESSING = "PROCESSING"
    SHIPPED = "SHIPPED"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"

class Currency(str, Enum):
    INR = "INR"
    USD = "USD"

# ============= MODELS =============
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    password_hash: str
    role: UserRole = UserRole.USER
    phone: Optional[str] = None
    full_name: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    slug: str
    description: str
    price_inr: float
    price_usd: float
    stock: int
    images: List[str]
    category: str = "accessories"
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OrderItem(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    price: float
    size: Optional[str] = None

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_email: str
    items: List[OrderItem]
    total_amount: float
    currency: Currency
    status: OrderStatus = OrderStatus.PENDING
    courier_name: Optional[str] = None
    tracking_id: Optional[str] = None
    shipping_address: dict
    discount_code: Optional[str] = None
    discount_amount: float = 0.0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DiscountCode(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    code: str
    discount_type: str  # "percentage" or "fixed"
    discount_value: float
    min_order_amount: float = 0.0
    max_uses: Optional[int] = None
    uses_count: int = 0
    is_active: bool = True
    valid_from: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    valid_until: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DiscountPopup(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    message: str
    discount_code: Optional[str] = None
    is_active: bool = True
    display_duration: int = 5000  # milliseconds
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ============= REQUEST/RESPONSE MODELS =============
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    role: UserRole
    full_name: Optional[str] = None
    phone: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class ProductCreate(BaseModel):
    name: str
    slug: str
    description: str
    price_inr: float
    price_usd: float
    stock: int
    images: List[str]
    category: str = "accessories"

class OrderCreate(BaseModel):
    items: List[OrderItem]
    shipping_address: dict
    currency: Currency
    discount_code: Optional[str] = None

class DiscountCodeCreate(BaseModel):
    code: str
    discount_type: str
    discount_value: float
    min_order_amount: float = 0.0
    max_uses: Optional[int] = None
    valid_until: Optional[datetime] = None

class DiscountPopupCreate(BaseModel):
    title: str
    message: str
    discount_code: Optional[str] = None
    display_duration: int = 5000

class OrderStatusUpdate(BaseModel):
    status: OrderStatus
    courier_name: Optional[str] = None
    tracking_id: Optional[str] = None

# ============= AUTH UTILITIES =============
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, email: str, role: str) -> str:
    payload = {
        'user_id': user_id,
        'email': email,
        'role': role,
        'exp': datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    token = credentials.credentials
    payload = decode_token(token)
    user = await db.users.find_one({"id": payload['user_id']}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

async def require_admin(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user['role'] != UserRole.ADMIN.value:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

# ============= AUTH ROUTES =============
@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserRegister):
    # Check if user exists
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user = User(
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        full_name=user_data.full_name,
        phone=user_data.phone,
        role=UserRole.USER
    )
    
    doc = user.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.users.insert_one(doc)
    
    token = create_token(user.id, user.email, user.role.value)
    
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user.id,
            email=user.email,
            role=user.role,
            full_name=user.full_name,
            phone=user.phone
        )
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user['id'], user['email'], user['role'])
    
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user['id'],
            email=user['email'],
            role=UserRole(user['role']),
            full_name=user.get('full_name'),
            phone=user.get('phone')
        )
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user['id'],
        email=current_user['email'],
        role=UserRole(current_user['role']),
        full_name=current_user.get('full_name'),
        phone=current_user.get('phone')
    )

# ============= PRODUCT ROUTES =============
@api_router.get("/products", response_model=List[Product])
async def get_products(category: Optional[str] = None):
    query = {"is_active": True}
    if category:
        query["category"] = category
    products = await db.products.find(query, {"_id": 0}).to_list(1000)
    for p in products:
        if isinstance(p['created_at'], str):
            p['created_at'] = datetime.fromisoformat(p['created_at'])
    return products

@api_router.get("/products/{slug}", response_model=Product)
async def get_product(slug: str):
    product = await db.products.find_one({"slug": slug, "is_active": True}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if isinstance(product['created_at'], str):
        product['created_at'] = datetime.fromisoformat(product['created_at'])
    return product

# ============= ADMIN PRODUCT ROUTES =============
@api_router.post("/admin/products", response_model=Product)
async def create_product(product_data: ProductCreate, admin: dict = Depends(require_admin)):
    product = Product(**product_data.model_dump())
    doc = product.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.products.insert_one(doc)
    return product

@api_router.put("/admin/products/{product_id}", response_model=Product)
async def update_product(product_id: str, product_data: ProductCreate, admin: dict = Depends(require_admin)):
    existing = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = product_data.model_dump()
    await db.products.update_one({"id": product_id}, {"$set": update_data})
    
    updated = await db.products.find_one({"id": product_id}, {"_id": 0})
    if isinstance(updated['created_at'], str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    return updated

@api_router.delete("/admin/products/{product_id}")
async def delete_product(product_id: str, admin: dict = Depends(require_admin)):
    result = await db.products.update_one({"id": product_id}, {"$set": {"is_active": False}})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}

# ============= ORDER ROUTES =============
@api_router.post("/orders", response_model=Order)
async def create_order(order_data: OrderCreate, current_user: dict = Depends(get_current_user)):
    # Calculate total
    total = sum(item.price * item.quantity for item in order_data.items)
    discount_amount = 0.0
    
    # Apply discount if provided
    if order_data.discount_code:
        discount = await db.discount_codes.find_one(
            {"code": order_data.discount_code.upper(), "is_active": True},
            {"_id": 0}
        )
        if discount:
            if discount.get('max_uses') and discount.get('uses_count', 0) >= discount['max_uses']:
                raise HTTPException(status_code=400, detail="Discount code usage limit reached")
            if total >= discount.get('min_order_amount', 0):
                if discount['discount_type'] == 'percentage':
                    discount_amount = total * (discount['discount_value'] / 100)
                else:
                    discount_amount = discount['discount_value']
                total -= discount_amount
                # Increment usage
                await db.discount_codes.update_one(
                    {"code": order_data.discount_code.upper()},
                    {"$inc": {"uses_count": 1}}
                )
    
    order = Order(
        user_id=current_user['id'],
        user_email=current_user['email'],
        items=[item.model_dump() for item in order_data.items],
        total_amount=total,
        currency=order_data.currency,
        shipping_address=order_data.shipping_address,
        discount_code=order_data.discount_code,
        discount_amount=discount_amount
    )
    
    doc = order.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    await db.orders.insert_one(doc)
    
    return order

@api_router.get("/orders", response_model=List[Order])
async def get_user_orders(current_user: dict = Depends(get_current_user)):
    orders = await db.orders.find({"user_id": current_user['id']}, {"_id": 0}).to_list(1000)
    for o in orders:
        if isinstance(o['created_at'], str):
            o['created_at'] = datetime.fromisoformat(o['created_at'])
        if isinstance(o['updated_at'], str):
            o['updated_at'] = datetime.fromisoformat(o['updated_at'])
    return orders

@api_router.get("/orders/{order_id}", response_model=Order)
async def get_order(order_id: str, current_user: dict = Depends(get_current_user)):
    order = await db.orders.find_one({"id": order_id, "user_id": current_user['id']}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if isinstance(order['created_at'], str):
        order['created_at'] = datetime.fromisoformat(order['created_at'])
    if isinstance(order['updated_at'], str):
        order['updated_at'] = datetime.fromisoformat(order['updated_at'])
    return order

# ============= ADMIN ORDER ROUTES =============
@api_router.get("/admin/orders", response_model=List[Order])
async def get_all_orders(admin: dict = Depends(require_admin)):
    orders = await db.orders.find({}, {"_id": 0}).to_list(1000)
    for o in orders:
        if isinstance(o['created_at'], str):
            o['created_at'] = datetime.fromisoformat(o['created_at'])
        if isinstance(o['updated_at'], str):
            o['updated_at'] = datetime.fromisoformat(o['updated_at'])
    return orders

@api_router.put("/admin/orders/{order_id}", response_model=Order)
async def update_order_status(order_id: str, status_update: OrderStatusUpdate, admin: dict = Depends(require_admin)):
    update_data = {"status": status_update.status.value, "updated_at": datetime.now(timezone.utc).isoformat()}
    if status_update.courier_name:
        update_data["courier_name"] = status_update.courier_name
    if status_update.tracking_id:
        update_data["tracking_id"] = status_update.tracking_id
    
    result = await db.orders.update_one({"id": order_id}, {"$set": update_data})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if isinstance(order['created_at'], str):
        order['created_at'] = datetime.fromisoformat(order['created_at'])
    if isinstance(order['updated_at'], str):
        order['updated_at'] = datetime.fromisoformat(order['updated_at'])
    return order

# ============= DISCOUNT CODE ROUTES =============
@api_router.post("/discount/validate")
async def validate_discount(code: str, order_amount: float):
    discount = await db.discount_codes.find_one(
        {"code": code.upper(), "is_active": True},
        {"_id": 0}
    )
    if not discount:
        raise HTTPException(status_code=404, detail="Invalid discount code")
    
    if discount.get('max_uses') and discount.get('uses_count', 0) >= discount['max_uses']:
        raise HTTPException(status_code=400, detail="Discount code usage limit reached")
    
    if order_amount < discount.get('min_order_amount', 0):
        raise HTTPException(status_code=400, detail=f"Minimum order amount is {discount['min_order_amount']}")
    
    discount_amount = 0
    if discount['discount_type'] == 'percentage':
        discount_amount = order_amount * (discount['discount_value'] / 100)
    else:
        discount_amount = discount['discount_value']
    
    return {
        "valid": True,
        "discount_amount": discount_amount,
        "code": discount['code']
    }

# ============= ADMIN DISCOUNT ROUTES =============
@api_router.get("/admin/discounts", response_model=List[DiscountCode])
async def get_discounts(admin: dict = Depends(require_admin)):
    discounts = await db.discount_codes.find({}, {"_id": 0}).to_list(1000)
    for d in discounts:
        if isinstance(d['created_at'], str):
            d['created_at'] = datetime.fromisoformat(d['created_at'])
        if isinstance(d['valid_from'], str):
            d['valid_from'] = datetime.fromisoformat(d['valid_from'])
        if d.get('valid_until') and isinstance(d['valid_until'], str):
            d['valid_until'] = datetime.fromisoformat(d['valid_until'])
    return discounts

@api_router.post("/admin/discounts", response_model=DiscountCode)
async def create_discount(discount_data: DiscountCodeCreate, admin: dict = Depends(require_admin)):
    # Check if code exists
    existing = await db.discount_codes.find_one({"code": discount_data.code.upper()}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Discount code already exists")
    
    discount = DiscountCode(**discount_data.model_dump(), code=discount_data.code.upper())
    doc = discount.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['valid_from'] = doc['valid_from'].isoformat()
    if doc.get('valid_until'):
        doc['valid_until'] = doc['valid_until'].isoformat()
    await db.discount_codes.insert_one(doc)
    return discount

@api_router.put("/admin/discounts/{discount_id}", response_model=DiscountCode)
async def update_discount(discount_id: str, discount_data: DiscountCodeCreate, admin: dict = Depends(require_admin)):
    update_data = discount_data.model_dump()
    update_data['code'] = update_data['code'].upper()
    if update_data.get('valid_until'):
        update_data['valid_until'] = update_data['valid_until'].isoformat()
    
    result = await db.discount_codes.update_one({"id": discount_id}, {"$set": update_data})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Discount not found")
    
    discount = await db.discount_codes.find_one({"id": discount_id}, {"_id": 0})
    if isinstance(discount['created_at'], str):
        discount['created_at'] = datetime.fromisoformat(discount['created_at'])
    if isinstance(discount['valid_from'], str):
        discount['valid_from'] = datetime.fromisoformat(discount['valid_from'])
    if discount.get('valid_until') and isinstance(discount['valid_until'], str):
        discount['valid_until'] = datetime.fromisoformat(discount['valid_until'])
    return discount

@api_router.delete("/admin/discounts/{discount_id}")
async def delete_discount(discount_id: str, admin: dict = Depends(require_admin)):
    result = await db.discount_codes.delete_one({"id": discount_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Discount not found")
    return {"message": "Discount deleted successfully"}

# ============= DISCOUNT POPUP ROUTES =============
@api_router.get("/popups", response_model=List[DiscountPopup])
async def get_active_popups():
    popups = await db.discount_popups.find({"is_active": True}, {"_id": 0}).to_list(10)
    for p in popups:
        if isinstance(p['created_at'], str):
            p['created_at'] = datetime.fromisoformat(p['created_at'])
    return popups

@api_router.get("/admin/popups", response_model=List[DiscountPopup])
async def get_all_popups(admin: dict = Depends(require_admin)):
    popups = await db.discount_popups.find({}, {"_id": 0}).to_list(1000)
    for p in popups:
        if isinstance(p['created_at'], str):
            p['created_at'] = datetime.fromisoformat(p['created_at'])
    return popups

@api_router.post("/admin/popups", response_model=DiscountPopup)
async def create_popup(popup_data: DiscountPopupCreate, admin: dict = Depends(require_admin)):
    popup = DiscountPopup(**popup_data.model_dump())
    doc = popup.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.discount_popups.insert_one(doc)
    return popup

@api_router.put("/admin/popups/{popup_id}", response_model=DiscountPopup)
async def update_popup(popup_id: str, popup_data: DiscountPopupCreate, admin: dict = Depends(require_admin)):
    update_data = popup_data.model_dump()
    result = await db.discount_popups.update_one({"id": popup_id}, {"$set": update_data})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Popup not found")
    
    popup = await db.discount_popups.find_one({"id": popup_id}, {"_id": 0})
    if isinstance(popup['created_at'], str):
        popup['created_at'] = datetime.fromisoformat(popup['created_at'])
    return popup

@api_router.delete("/admin/popups/{popup_id}")
async def delete_popup(popup_id: str, admin: dict = Depends(require_admin)):
    result = await db.discount_popups.delete_one({"id": popup_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Popup not found")
    return {"message": "Popup deleted successfully"}

# ============= ADMIN USER ROUTES =============
@api_router.get("/admin/users", response_model=List[UserResponse])
async def get_all_users(admin: dict = Depends(require_admin)):
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(1000)
    return [UserResponse(**u) for u in users]

# ============= ADMIN STATS =============
@api_router.get("/admin/stats")
async def get_stats(admin: dict = Depends(require_admin)):
    total_users = await db.users.count_documents({"role": "USER"})
    total_products = await db.products.count_documents({"is_active": True})
    total_orders = await db.orders.count_documents({})
    pending_orders = await db.orders.count_documents({"status": "PENDING"})
    
    # Calculate revenue
    orders = await db.orders.find({"status": {"$in": ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"]}}, {"_id": 0}).to_list(10000)
    total_revenue = sum(o.get('total_amount', 0) for o in orders)
    
    return {
        "total_users": total_users,
        "total_products": total_products,
        "total_orders": total_orders,
        "pending_orders": pending_orders,
        "total_revenue": total_revenue
    }

# Include router
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
