Changing the contents of the Welcome, About and Faq screens
===========================================================

The cBiT web application is packaged into a handful of
compressed JavaScript files on the server, so you can't
just edit HTML / CSS files for the welcome, about, faq
screens on the server.  Instead, you have to edit the
cBiT sources and redeploy the app.

Changing content
----------------
1. Edit one or more of the following files
   * `cbit/frontend/src/app/pages/welcome/welcome.page.ts`
   * `cbit/frontend/src/app/pages/about/about.page.ts`
   * `cbit/frontend/src/app/pages/faq/faq.page.ts`
   -  HTML code goes at the top, CSS styling code goes right below
   -  You can place images under `cbit/frontend/assets/images`,
      then refer to them in the HTML with the URL `"/assets/images/my_little_pony.jpeg"`
   - Backgrounds for all the pages are defined in `cbit/frontend/src/app/cbit.component.ts`.
2. Save the files
3. Commit and push the changes to the git repository


Redeploy app
------------
1. Start VirtualBox
2. Start the cBiT deployment machine
3. Login using cbit / cbit!Deploy
4. Open a terminal window
   - Go to the cbit code
   ```
   cd Code/cbit
   ```
   - Get latest changes from GIT
   ```
   git pull
   ```
   - Go to the ansible directory
   ```
   cd ansible
   ```
   - Run the deployment command
   ```
   ansible-playbook playbook.yml --tags frontend
   ```


Questions?
----------
If any changes seem too hard to implement, please do
email us at `info@hatchsoftware.be` and we will
get back to you as soon as we can.