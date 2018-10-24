FROM jupyter/scipy-notebook:latest

EXPOSE 8888
ENV NODE_ENV development

USER root

# Install libraries used by geopandas
RUN sudo apt-get update
RUN sudo apt-get install -y libgeos-dev

RUN sudo apt-get install -y \
    wget \
    build-essential \
    gdal-bin \
    curl \
    zip \
    unzip

RUN sudo apt-get install -y \
    libspatialindex-dev --fix-missing

RUN apt-get install python-gdal -y

USER jovyan

WORKDIR /home/jovyan/work
RUN cd /home/jovyan/work

COPY requirements.txt .
RUN pip install -r requirements.txt
