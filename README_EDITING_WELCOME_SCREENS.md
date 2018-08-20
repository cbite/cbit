Changing the contents of the Welcome and About screens
======================================================

The cBiT web application is packaged into a handful of
compressed JavaScript files on the server, so you can't
just edit HTML / CSS files for the welcome and about
screens on the server.  Instead, you have to edit the
cBiT sources and redeploy the app (following the
instructions in `README.txt`).  Alex knows how to perform
the redeploy and we verified that it worked for him on
Wed 14 Dec 2016.

Steps
-----
1. Edit the files `cbit/frontend/src/app/welcome.component.ts`
   or `cbit/frontend/src/app/about.component.ts`.
2. HTML code goes at the top, CSS styling code goes right below
3. You can place images under `cbit/frontend/assets/images`,
   then refer to them in the HTML with the URL `"/assets/images/my_little_pony.jpeg"`
4. Backgrounds for all the pages are defined in `cbit/frontend/src/app/cbit.component.ts`.
   You may especially want to tweak the CSS styles for `#bg1` and `#bg2`.
4. Save the files and redeploy, e.g., run
```
cd cbit/ansible
ansible-playbook playbook.yml --tags frontend
```

Questions?
----------
If any changes seem too hard to implement, please do
email me at `patrick.varilly@dataminded.be` and I will
get back to you as soon as I can.