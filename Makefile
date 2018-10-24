local:
	docker-compose up frontend

rebuild:
	docker-compose build --no-cache frontend

models-lint:
	docker-compose run --no-deps explorer bash -c "flake8 ./models"
	docker-compose run --no-deps explorer bash -c "pep257 ./models"

# Run test suite locally.
models-test: FORCE
	docker-compose run --no-deps explorer pytest -s models/tests


# Run coverage.
models-coverage:
	docker-compose run --no-deps explorer pytest --cov=models --cov-config .coveragerc --cov-fail-under=90 --cov-report term-missing

# [Dummy dependency to force a make command to always run.]
FORCE:

# Backend tests
backend-lint:
	docker-compose run --no-deps backend bash -c "flake8 ."
	docker-compose run --no-deps backend bash -c "pep257 ."

backend-test:
	docker-compose run --no-deps backend pytest -s tests

# Frontend tests
frontend-lint:
	echo "Missing frontend-lint"

frontend-test:
	docker-compose run -e CI=true --no-deps frontend yarn test

# Webapp tests
webapp-lint:
	$(MAKE) backend-lint
	$(MAKE) frontend-lint

webapp-test:
	$(MAKE) backend-test
	$(MAKE) frontend-test


# Run ETL process using prior results.
etl:
	docker-compose run --no-deps explorer bash -c "python models/etl/runner.py"

# Run ETL process using prior results.
etl_from_scratch:
	docker-compose run --no-deps explorer bash -c "python models/etl/runner.py --teardown"

# Fetch raw data for use in the ETL
S3_BUCKET='https://s3-us-west-1.amazonaws.com/network-adequacy/'
fetch_raw_etl_data:
	curl -o 'data/etl/raw_etl_data.zip' ${S3_BUCKET}'raw_etl_data.zip'
	unzip -o data/etl/raw_etl_data.zip
	rm data/etl/raw_etl_data.zip

