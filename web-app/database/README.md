The database is a Mongodb NoSQL database. Upon building the docker image, the seed sample data is downloaded automatically from a public S3 bucket.


### Seed Data
The mongodb Docker automatically downloads all necessary datasets and populate the database. If you need to download the seed files, you can do so by running the following in this directory:

     make all-sample-datasets

Similarly, full datasets for production can be built by running:

    make all-full-datasets
