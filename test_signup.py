import urllib.request
import json

url = "http://localhost:8000/api/v1/auth/signup"
data = {
    "nombre": "Test User",
    "email": "test123456@test.com",
    "password": "password"
}
req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'})

try:
    with urllib.request.urlopen(req) as res:
        print("Status:", res.status)
        print("Body:", res.read().decode())
except urllib.error.HTTPError as e:
    print("Status:", e.code)
    print("Body:", e.read().decode())
except Exception as e:
    print(e)

