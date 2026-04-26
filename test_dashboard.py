import urllib.request
import json

url = "http://localhost:8000/api/v1/dashboard/"
try:
    req = urllib.request.Request(url, headers={'Authorization': 'Bearer fake-token'})
    with urllib.request.urlopen(req) as res:
        print("Status:", res.status)
        print("Body:", res.read().decode())
except urllib.error.HTTPError as e:
    print("Status:", e.code)
    print("Body:", e.read().decode())
except Exception as e:
    print("Error:", e)
