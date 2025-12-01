import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
import bcrypt
from datetime import datetime, timezone
import uuid

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

async def seed_database():
    print("🌱 Starting database seed...")
    
    # Clear existing data
    print("Clearing existing collections...")
    await db.users.delete_many({})
    await db.products.delete_many({})
    await db.orders.delete_many({})
    await db.discount_codes.delete_many({})
    await db.discount_popups.delete_many({})
    
    # Seed Admin User
    print("Creating admin user...")
    admin_user = {
        "id": str(uuid.uuid4()),
        "email": "blend4uwithhhezz@gmail.com",
        "password_hash": hash_password("$@Bunny25Jain*"),
        "role": "ADMIN",
        "full_name": "Blend4u Admin",
        "phone": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(admin_user)
    print(f"✅ Admin user created: {admin_user['email']}")
    
    # Seed Demo User
    print("Creating demo user...")
    demo_user = {
        "id": str(uuid.uuid4()),
        "email": "demo.blend4u@gmail.com",
        "password_hash": hash_password("Blend@Demo"),
        "role": "USER",
        "full_name": "Demo User",
        "phone": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(demo_user)
    print(f"✅ Demo user created: {demo_user['email']}")
    
    # Seed Products
    print("Creating products...")
    products = [
        {
            "id": str(uuid.uuid4()),
            "name": "Vintage Baseball Socks",
            "slug": "vintage-baseball-socks",
            "description": "Classic vintage-style baseball socks with premium comfort and durability. Perfect for sports enthusiasts and casual wear.",
            "price_inr": 599,
            "price_usd": 7.99,
            "stock": 50,
            "images": [
                "https://customer-assets.emergentagent.com/job_cf372bce-09fe-40c5-a580-939c2fdf2eec/artifacts/gb4epzbm_Pic%201%20Upscaled.png",
                "https://customer-assets.emergentagent.com/job_cf372bce-09fe-40c5-a580-939c2fdf2eec/artifacts/gb4epzbm_Pic%201%20Upscaled.png",
                "https://customer-assets.emergentagent.com/job_cf372bce-09fe-40c5-a580-939c2fdf2eec/artifacts/gb4epzbm_Pic%201%20Upscaled.png",
                "https://customer-assets.emergentagent.com/job_cf372bce-09fe-40c5-a580-939c2fdf2eec/artifacts/gb4epzbm_Pic%201%20Upscaled.png",
                "https://customer-assets.emergentagent.com/job_cf372bce-09fe-40c5-a580-939c2fdf2eec/artifacts/gb4epzbm_Pic%201%20Upscaled.png"
            ],
            "category": "socks",
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Vintage Socks",
            "slug": "vintage-socks",
            "description": "Timeless vintage socks collection with premium cotton blend. Comfortable all-day wear with retro style.",
            "price_inr": 599,
            "price_usd": 7.99,
            "stock": 75,
            "images": [
                "https://customer-assets.emergentagent.com/job_cf372bce-09fe-40c5-a580-939c2fdf2eec/artifacts/vpxokldm_Pic%202%20Upscaled.png",
                "https://customer-assets.emergentagent.com/job_cf372bce-09fe-40c5-a580-939c2fdf2eec/artifacts/vpxokldm_Pic%202%20Upscaled.png",
                "https://customer-assets.emergentagent.com/job_cf372bce-09fe-40c5-a580-939c2fdf2eec/artifacts/vpxokldm_Pic%202%20Upscaled.png",
                "https://customer-assets.emergentagent.com/job_cf372bce-09fe-40c5-a580-939c2fdf2eec/artifacts/vpxokldm_Pic%202%20Upscaled.png",
                "https://customer-assets.emergentagent.com/job_cf372bce-09fe-40c5-a580-939c2fdf2eec/artifacts/vpxokldm_Pic%202%20Upscaled.png"
            ],
            "category": "socks",
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Thunder Socks",
            "slug": "thunder-socks",
            "description": "High-performance Thunder Socks with moisture-wicking technology. Ideal for intense workouts and athletic activities.",
            "price_inr": 599,
            "price_usd": 7.99,
            "stock": 60,
            "images": [
                "https://customer-assets.emergentagent.com/job_cf372bce-09fe-40c5-a580-939c2fdf2eec/artifacts/gb4epzbm_Pic%201%20Upscaled.png",
                "https://customer-assets.emergentagent.com/job_cf372bce-09fe-40c5-a580-939c2fdf2eec/artifacts/gb4epzbm_Pic%201%20Upscaled.png",
                "https://customer-assets.emergentagent.com/job_cf372bce-09fe-40c5-a580-939c2fdf2eec/artifacts/gb4epzbm_Pic%201%20Upscaled.png",
                "https://customer-assets.emergentagent.com/job_cf372bce-09fe-40c5-a580-939c2fdf2eec/artifacts/gb4epzbm_Pic%201%20Upscaled.png",
                "https://customer-assets.emergentagent.com/job_cf372bce-09fe-40c5-a580-939c2fdf2eec/artifacts/gb4epzbm_Pic%201%20Upscaled.png"
            ],
            "category": "socks",
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Gym Bag with Shoe Compartment",
            "slug": "gym-bag-shoe-compartment",
            "description": "Spacious gym bag featuring a dedicated shoe compartment. Perfect for fitness enthusiasts who need organized storage.",
            "price_inr": 799,
            "price_usd": 10.99,
            "stock": 30,
            "images": [
                "https://customer-assets.emergentagent.com/job_cf372bce-09fe-40c5-a580-939c2fdf2eec/artifacts/vpxokldm_Pic%202%20Upscaled.png",
                "https://customer-assets.emergentagent.com/job_cf372bce-09fe-40c5-a580-939c2fdf2eec/artifacts/vpxokldm_Pic%202%20Upscaled.png",
                "https://customer-assets.emergentagent.com/job_cf372bce-09fe-40c5-a580-939c2fdf2eec/artifacts/vpxokldm_Pic%202%20Upscaled.png",
                "https://customer-assets.emergentagent.com/job_cf372bce-09fe-40c5-a580-939c2fdf2eec/artifacts/vpxokldm_Pic%202%20Upscaled.png",
                "https://customer-assets.emergentagent.com/job_cf372bce-09fe-40c5-a580-939c2fdf2eec/artifacts/vpxokldm_Pic%202%20Upscaled.png"
            ],
            "category": "bags",
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Bottle Juicer Blender",
            "slug": "bottle-juicer-blender",
            "description": "Portable bottle juicer blender for smoothies on-the-go. USB rechargeable with powerful blending capabilities.",
            "price_inr": 899,
            "price_usd": 11.99,
            "stock": 40,
            "images": [
                "https://customer-assets.emergentagent.com/job_cf372bce-09fe-40c5-a580-939c2fdf2eec/artifacts/gb4epzbm_Pic%201%20Upscaled.png",
                "https://customer-assets.emergentagent.com/job_cf372bce-09fe-40c5-a580-939c2fdf2eec/artifacts/gb4epzbm_Pic%201%20Upscaled.png",
                "https://customer-assets.emergentagent.com/job_cf372bce-09fe-40c5-a580-939c2fdf2eec/artifacts/gb4epzbm_Pic%201%20Upscaled.png",
                "https://customer-assets.emergentagent.com/job_cf372bce-09fe-40c5-a580-939c2fdf2eec/artifacts/gb4epzbm_Pic%201%20Upscaled.png",
                "https://customer-assets.emergentagent.com/job_cf372bce-09fe-40c5-a580-939c2fdf2eec/artifacts/gb4epzbm_Pic%201%20Upscaled.png"
            ],
            "category": "accessories",
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.products.insert_many(products)
    print(f"✅ Created {len(products)} products")
    
    # Seed Discount Codes
    print("Creating discount codes...")
    discounts = [
        {
            "id": str(uuid.uuid4()),
            "code": "WELCOME10",
            "discount_type": "percentage",
            "discount_value": 10,
            "min_order_amount": 0,
            "max_uses": 1000,
            "uses_count": 0,
            "is_active": True,
            "valid_from": datetime.now(timezone.utc).isoformat(),
            "valid_until": None,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "code": "BLEND20",
            "discount_type": "percentage",
            "discount_value": 20,
            "min_order_amount": 1000,
            "max_uses": 500,
            "uses_count": 0,
            "is_active": True,
            "valid_from": datetime.now(timezone.utc).isoformat(),
            "valid_until": None,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.discount_codes.insert_many(discounts)
    print(f"✅ Created {len(discounts)} discount codes")
    
    # Seed Discount Popups
    print("Creating discount popups...")
    popups = [
        {
            "id": str(uuid.uuid4()),
            "title": "Welcome to Blend4u!",
            "message": "Get 10% OFF on your first order - Use code WELCOME10",
            "discount_code": "WELCOME10",
            "is_active": True,
            "display_duration": 8000,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.discount_popups.insert_many(popups)
    print(f"✅ Created {len(popups)} discount popups")
    
    print("\n🎉 Database seeded successfully!")
    print("\n📧 Admin Login:")
    print("   Email: blend4uwithhhezz@gmail.com")
    print("   Password: [Securely stored]")
    print("\n📧 Demo User Login:")
    print("   Email: demo.blend4u@gmail.com")
    print("   Password: [Securely stored]")

if __name__ == "__main__":
    asyncio.run(seed_database())
