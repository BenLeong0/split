from flask import Flask, Response, request

app = Flask(__name__)


@app.route("/")
def ping():
    return Response(201)


# USERS

# TODO
@app.route("/api/create_user", methods=["POST"])
def create_user():
    if request.method == "OPTIONS":
        return Response(201)
    print('creating user...')
    return Response(201)