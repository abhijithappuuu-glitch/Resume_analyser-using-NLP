import sys
print(sys.path)
try:
    import bcrypt
    print("bcrypt imported successfully")
except ImportError as e:
    print(f"Error importing bcrypt: {e}")
