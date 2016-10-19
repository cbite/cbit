cBiT
====

cBiT is a data warehouse for collecting gene expression data for cells grown on different materials. 
cBiT is maintained by the [University of Maastricht](https://www.maastrichtuniversity.nl/)'s [MERLN](http://merln.maastrichtuniversity.nl/) lab.

Installing
----------
1. Change `ssh_config` so that `cbit` refers to the host machine
2. From the `ansible` directory, run `ansible-playbook playbook.yml`

Developing
----------
1. Set up a Python 3.5 `virtualenv` by running
```
virtualenv -p python3.5 vence
```
2. Activate the `virtualenv` by running
```
source ./venv/bin/activate
```
3. Install all necessary Python packages by running
```
pip install -r requirements.txt
```