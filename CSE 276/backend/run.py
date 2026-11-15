import os
from app import create_app
from config import Config

app = create_app()

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'True').lower() in ['true', '1', 'yes']
    print(f"===========================================================")
    print(f"  Generative Content Transformation Platform (GCTP) Backend")
    print(f"  Running on: http://127.0.0.1:{port}")
    print(f"  Database:   {Config.SQLALCHEMY_DATABASE_URI}")
    print(f"  AI Mode:    {Config.AI_PROVIDER.upper()}")
    print(f"===========================================================")
    app.run(host='0.0.0.0', port=port, debug=debug)
