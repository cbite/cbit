cBiT
====

cBiT is a data warehouse for collecting gene expression data for cells grown on different materials. 
cBiT is maintained by the [Eindhoven University of Technology](https://www.tue.nl/)'s [BiS](https://jandeboerlab.com/) lab.


Create Local Environment
------------------------
1. Make sure you have python and pip on your local machine

2. Install Ansible
```
pip install 'ansible==2.1.2.0'
OR
sudo pip install ansible
```

3. Install PostgreSQL
```
brew install postgresql
```

4. Install ElasticSearch (only works with version 2.4)
```
brew install elasticsearch@2.4
```

5. Install virtualenv
```
sudo pip install virtualenv
```

6. Install all necessary Python packages by running
```
pip install -r requirements.txt
```

7. Start up a PostgreSQL 9.5 server and run the following initial queries with `psql`:
```
CREATE DATABASE cbit;
CREATE USER cbit PASSWORD '2076a675b6d813b582977189c13a3279cc9cf02a9aeab01389798d9167cf259c8b247aee9a2be149';
```

8. Initialize the ElasticSearch and PostgreSQL databases by running:
```
cd cbit/backend
./set_up_dbs.py
```

9. Set up a Python 2.7 `virtualenv` in the `cbit` folder by running
```
cd cbit
virtualenv -p python2.7 venv
```

Local Development
-----------------
1. Start up an ElasticSearch 2.4.1 server, e.g.,
```
cd ~/elasticsearch-2.4.1
./bin/elasticsearch
```
OR
```
cd /usr/local/Cellar/elasticsearch\@2.4/2.4.6_1/
./bin/elasticsearch
```

2.  Start postgreSQL
```
pg_ctl -D /usr/local/var/postgres start
```
Tip: Stop postgreSQL
```
pg_ctl -D /usr/local/var/postgres stop
```

3. For front-end development, first make sure you can run the [Angular 2 Quickstart](https://angular.io/docs/ts/latest/quickstart.html).  Then run:
```
cd cbit/frontend
npm install  # Only run once
npm start    # Go to http://localhost:8080
```

4. To run the backend locally, run following command after activating your virtual environment
```
source ./venv/bin/activate
cd cbit/backend
sh run-backend-server.sh
```

Deployment
----------
1. Install the following prerequisites (or use the 'cBiT deployment' virtual machine that was delivered):
 - Ansible (`>=2.1.2.0`)
 - Recent versions of `node` (e.g., `>= 4.6.1`) and `npm` (e.g., `>= 3.10.9`)
2. To ensure that `cbit` machine's `sudo` is correctly configured, run the following command from the `ansible` directory:
```
ANSIBLE_SSH_PIPELINING=0 ansible-playbook playbook-PRERUN.yml
```
4. If that fails, manually run `sudo visudo` on the `cbit` machine and follow the manual edit instructions at the top of `playbook-PRERUN.yml`
5. From the `ansible` directory, run:
```
ansible-playbook playbook.yml
```
You only need to run the full playbook when starting from an empty machine.  If you just want to publish changes to the backend / frontend, run one of these commands:
```
ansible-playbook playbook.yml --tags frontend
ansible-playbook playbook.yml --tags backend
ansible-playbook playbook.yml --tags backend,frontend
```

  'cBiT deployment' virtual machine setup
  ---------------------------------------
  Ubuntu 18.04.1 LTS
	  - Installed software
		  ○ Node v8.11.3
		  ○ NPM v5.6.0
		  ○ Python v2.7.15
		  ○ Pip v9.0.1
		  ○ Git v2.17.1
		  ○ Ansible v2.1.2.0
		  ○ Webstorm v2018.2.1 (trial version)
	  - Credentials: cbit / cbit!Deploy


Troubleshooting
---------------
A few hints in case something goes wrong.

1. Log into the cbit machine,

2. Look at the cBiT backend logs, e.g.,
```
sudo tail -F /var/log/cbit-backend/{access,error}.log
```
3. Is the disk full?  Look at the output of
```
df -h
```
If it is, you may have to delete stale uploads / downloads from `/home/cbit/backend/{uploads,downloads}`.
3. Re-deploy cBiT following the deployment instructions above.
4. Restart the machine by running
```
sudo shutdown -r now
```


Debugging Python Backend
-------------------------
- Go to PyCharm -> preferences -> Python Debugger
- Enable 'Gevent compatible'

- Go to Run -> Edit configurations
- Create a new Python configuration with settings as indicated below
Script path: <repo location>/venv/bin/gunicorn
Parameters: -c <repo location>/backend/config/gunicorn-config.py -w 4 backend-server:app
Python interpreter: The one from the virtual environment
