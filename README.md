<h1 align="center">Parivahan</h1>

<p align="center">
A simplified vehicle and driving licence management system for managing vehicle registrations, licences, challans, and related records.
</p>

<hr>

<h2>Overview</h2>

<p>
This system models basic services similar to a vehicle and transport management platform.
Users can view their vehicles, licences, and challans, while officers and administrators manage records and issue challans.
</p>

<p>
The application focuses on structured data management and role-based access to vehicle and licence information.
</p>

<hr>

<h2>Features</h2>

<h3>User</h3>
<ul>
<li>View registered vehicles</li>
<li>View driving licence details</li>
<li>View pending challans</li>
<li>Pay challans</li>
<li>Receive notifications</li>
</ul>

<h3>Officer</h3>
<ul>
<li>Issue traffic challans</li>
<li>View vehicle details</li>
<li>View licence details</li>
</ul>

<h3>Admin</h3>
<ul>
<li>Manage users</li>
<li>Manage vehicles</li>
<li>Manage licences</li>
<li>Manage challans</li>
</ul>

<hr>

<h2>Tech Stack</h2>

<ul>
<li><b>Frontend:</b> React</li>
<li><b>Backend:</b> Node.js, Express</li>
<li><b>Database:</b> MySQL</li>
</ul>

<hr>

<h2>Database Tables</h2>

<ul>
<li>User</li>
<li>Vehicle</li>
<li>Vehicle_Ownership</li>
<li>Driving_Licence</li>
<li>Challan</li>
<li>Payment</li>
<li>Notification</li>
<li>Officer</li>
<li>Admin</li>
</ul>

<p>
These tables are connected using primary keys and foreign keys to maintain relationships between entities.
</p>

<hr>

<h2>Project Structure</h2>

<pre>
Parivahan
│
├── frontend      React application
├── backend       Node.js + Express server
├── database      SQL schema and sample data
│
└── README.md
</pre>

<hr>

<h2>Setup</h2>

<h3>1. Clone the repository</h3>

<pre>
git clone https://github.com/yourusername/parivahan.git
cd parivahan
</pre>

<h3>2. Setup the database</h3>

<p>Install MySQL and import the SQL file.</p>

<pre>
SOURCE database/schema.sql;
</pre>

<h3>3. Run the backend</h3>

<pre>
cd backend
npm install
npm start
</pre>

<h3>4. Run the frontend</h3>

<pre>
cd frontend
npm install
npm start
</pre>
