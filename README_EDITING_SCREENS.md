Changing the contents of the Welcome, About and Faq screens
===========================================================

The cBiT web application is packaged into a handful of
compressed JavaScript files on the server, so you can't
just edit HTML / CSS files for the welcome, about, faq
screens on the server.  Instead, you have to edit the
cBiT sources and redeploy the app.

Starting the Virtual Machine + Webstorm
---------------------------------------
1. Start VirtualBox
2. Start the cBiT deployment machine
3. Login using cbit / cbit!Deploy
4. Open Webstorm (via 'Show Applications' in the bottom left corner


Changing content
----------------
1. Get latest changes from GIT
- In the menubar -> VCS -> Git -> Pull...
- Click 'Pull' in the popup

2. Edit one or more of the following files
   * `cbit/frontend/src/app/pages/welcome/welcome.page.ts`
   * `cbit/frontend/src/app/pages/about/about.page.ts`
   * `cbit/frontend/src/app/pages/faq/faq.page.ts`
   -  HTML code goes at the top, CSS styling code goes right below
   -  You can place images under `cbit/frontend/assets/images`,
      then refer to them in the HTML with the URL `"/assets/images/my_little_pony.jpeg"`
   - Backgrounds for all the pages are defined in `cbit/frontend/src/app/cbit.component.ts`.

3. Save the files

4. Commit and push the changes to the git repository
- In the menubar -> VCS -> Commit...
- Enter a description
- Click the arrow next to 'Commit' and select 'Commit and push'
- If a warning/review popup is shown, click 'Commit and push'
- Click 'Push'

5. Redeploy app
- Open the terminal window at the bottom
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