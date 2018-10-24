# Representative Population Generation

This document is the guide on how you can contribute to this project.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

You need to install and start Docker on your machine:

- [Instruction for Mac](https://www.docker.com/docker-mac)
- [Instruction for Windows](https://www.docker.com/docker-windows)

Also, install `docker-compose`:
```
pip install docker-compose
```

### Local development

To prepare the local enviroment for development follow these steps:

- clone this repository

```
git clone git@github.com:bayesimpact/representative-population-generator.git
```

- setup an API for MapBox
Setup the environment variable MAPBOX_TOKEN in your bash_profile, or as prefix to your docker-compose commands.

- start docker services in detached mode
```
make local
```


This spins up three docker services:

1. Node server for the frontend which is built on React.js, available on `localhost` port 80.
2. Nginx server for the backend which is built on Flask mircoservice and is availabe on port 8080.
3. Mongodb server for the database available on port 27017. It also retrives and load sample data from a public S3 bucket. You can use your favorite client (e.g. Robot 3T) to connent to the db with no user or password.

More information about each of these components is available in their respective subdirectory:

- [models](models/)
- [database](web-app/database/)
- [backend](web-app/backend/)
- [frontend](web-app/frontend/)

## Running the tests

All tests and lints are run autmatically on CircleCI, and PRs cannot be merged before passing them. To run webapp tests locally simply run
```
make webapp-test
```

### And coding style tests

To ensure consitency of the codebase, we use a linter with pep8 standards for the backend. To run the linter
```
make webapp-lint
```

## Contributing

### Reporting issues
Please report any bugs or improvements by opening a github issue [here](https://github.com/bayesimpact/representative-population-generator/issues).

### Adding new features
You can contribute to this repository by opening a pull request and assigning it to @ericboucher, @tetraptych, @mjamei or @philip.dickinson. After resolving all comments and passing all tests, your PR could be merged. 
