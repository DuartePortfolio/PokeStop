"""Simple seed script to populate the collections collection with sample data."""
from service import CollectionService


SAMPLE = [
    {"name": "Ash's Team", "owner": "ash@example.com", "items": ["Pikachu", "Charizard"]},
    {"name": "Misty's Water Team", "owner": "misty@example.com", "items": ["Staryu", "Psyduck"]},
]


def main():
    svc = CollectionService()
    for s in SAMPLE:
        svc.create(s)
    print("Seeded sample collections")


if __name__ == '__main__':
    main()
