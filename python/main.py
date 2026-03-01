# user_input = input("Enter name: ")
# with open("data/users.txt", "a") as f:
#     f.write(user_input + "\n")
# with open("data/users.txt", "r") as f:
#     names = f.readlines()
# print("All names:")
# for name in names:
#     if name.strip():
#         print(name.strip())


# try:
#     with open("data/users.txt", "r") as f:
#         names = f.readlines()
# except FileNotFoundError:
#     names = []


# print("All names:")
# for name in names:
#     if name.strip():
#         print(name.strip())


# import requests

# response = requests.get("https://meowfacts.herokuapp.com/")
# print(response.json()['data'])

import psycopg2
import os

def get_db_connection():
    return psycopg2.connect(
        dbname="postgres",
        user="postgres",
        password="aflEWzKejykX1jzV",
        host="db.fsjxrrgfoijvzhbicucw.supabase.co",
        port=5432,
        sslmode="require"
    )
    

def create_user_table():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS "user" (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(255)
        );
    """)
    conn.commit()
    cur.close()
    conn.close()

def insert_name(name, email):
    # Insert into DB
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        'INSERT INTO "user" (name, email) VALUES (%s, %s);',
        (name, email)
    )
    conn.commit()
    cur.close()
    conn.close()
    # Append the name to the file after DB insertion
    os.makedirs("./data", exist_ok=True)
    with open("./data/users-names.txt", "a") as f:
        f.write(name + "\n")

def print_all_names():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT name, email FROM "user";')
    rows = cur.fetchall()
    print("All names:")
    for row in rows:
        print(f"Name: {row[0]}, Email: {row[1]}")
    cur.close()
    conn.close()

def main():
    create_user_table()
    while True:
        user_input = input("Enter name (or 'q' to quit): ")
        if user_input.lower() == 'q':
            break
        email_input = input("Enter email: ")
        insert_name(user_input, email_input)
    print_all_names()

if __name__ == "__main__":
    main()
