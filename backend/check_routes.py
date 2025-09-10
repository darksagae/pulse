from app.main import app

print("Available routes:")
for route in app.routes:
    if hasattr(route, 'path'):
        methods = getattr(route, 'methods', ['N/A'])
        print(f"  {route.path} - {methods}")
