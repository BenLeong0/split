# split_types

Types used for Split


# Deployment

To build and deploy, run

```bash
pip install --upgrade build twine
python -m build
python -m twine upload dist/*
```

When prompted to log in, set the username as `__token__`, and the password as the
token generated on the PyPi website (see (here)[https://pypi.org/help/#apitoken]).