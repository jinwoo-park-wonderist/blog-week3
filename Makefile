.PHONY: up down migrate superuser logs build

up:
	docker compose up --build

down:
	docker compose down

migrate:
	docker compose exec web python manage.py migrate

superuser:
	docker compose exec web python manage.py createsuperuser

logs:
	docker compose logs -f web

build:
	docker compose build