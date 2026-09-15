import os
from pathlib import Path

# Must be set before application modules build their SQLAlchemy engine.
os.environ["DATABASE_URL"] = f"sqlite:///{Path(__file__).parent / 'test_app.db'}"

