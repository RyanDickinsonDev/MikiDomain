const fs = require('fs');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const path = require('path');
const net = require('net');
const fetch = require('node-fetch');
const xml2js = require('xml2js').parseStringPromise; // Use parseStringPromise for async/await


const commands = ["namecheap.domains.check", "namecheap.domains.getList", "namecheap.domains.getTldList"];


exports.domainListSearch = async (req, res) => {
    try {
        const { domain } = req.body;
        console.log(domain);
        //Make API call to getList 
        const apiUser = "ryand755wakonda";
        const apiKeySandBox = "bd0131b201a74c90b124860655bd103f";

        const clientIp = "143.42.119.113";

        const apiUrl = "https://api.sandbox.namecheap.com/xml.response?"
        //const getList = `${apiUrl}ApiUser=${apiUser}&ApiKey=${apiKeySandBox}&UserName=${apiUser}&Command=${commands[2]}&ClientIp=${clientIp}`;
        //const getList = `${apiUrl}ApiUser=${apiUser}&ApiKey=${apiKeySandBox}&UserName=${apiUser}&Command=${commands[1]}&ClientIp=${clientIp}`;
        const getList = `${apiUrl}ApiUser=${apiUser}&ApiKey=${apiKeySandBox}&UserName=${apiUser}&Command=${commands[0]}&ClientIp=${clientIp}&DomainList=${domain}`;
        //const getList = `${apiUrl}ApiUser=${apiUser}&ApiKey=${apiKeySandBox}&UserName=${apiUser}&Command=${commands[2]}&ClientIp=${clientIp}`;

        const response = await fetch(getList);
        //console.log(response);

        if (!response.ok) {
            // Handle non-successful responses (e.g., 404, 500, etc.)
            throw new Error(`API request failed with status ${response.status}`);
        }

        // Parse the XML response directly into JSON
        const xmlData = await response.text();
        const jsonData = await xml2js(xmlData);

        // Return the API response to the client
        res.status(200).json(jsonData);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Failed to process the API response' });
    }
}


exports.createSite = async (req, res) => {
    try {
        const { domain } = req.body;
        console.log(`Domain Received for create site ${domain}`);
        const serverHost = "http://localhost";

        const minPort = 8080;
        const maxPort = 65535; // Maximum port number
        const selectedPort = await findAvailablePort(minPort, maxPort);

        console.log(`Selected Port: ${selectedPort}`);

        const rootPath = `/var/www/${domain}`;
        const directoryPath = `/var/www/${domain}/nginx-configs`;
        const nginxConfigFilePath = path.join(directoryPath, `${domain}`); // Specify the file path

        // Check if the directory exists
        if (!fs.existsSync(directoryPath)) {
            // If it doesn't exist, create it
            fs.mkdirSync(directoryPath, { recursive: true });
        }

        // Generate NGINX server block configuration
        const nginxConfig = `
              server {
                  listen 80;
                  server_name ${domain};
                  root /var/www/${domain};
                  index index.html;
              
                  location / {
                      proxy_pass ${serverHost}:${selectedPort};
                  }
              
                  #     Additional configuration if needed
                  #     To Enable PHP on the domain use these lines 
                  #  location ~ \.php$ {
                  #  include snippets/fastcgi-php.conf;
                  #  fastcgi_pass unix:/var/run/php/php8.1-fpm.sock; # Adjust to match your PHP-FPM setup
                  #  }
              }
              `;

        // Write the NGINX configuration to the file path
        fs.writeFileSync(nginxConfigFilePath, nginxConfig);


        const nginxEnabledPath = `/etc/nginx/sites-enabled/${domain}`;

        console.log('Creating symbolic link...');
        exec(`sudo ln -s ${nginxConfigFilePath} ${nginxEnabledPath}`)
            .then(() => {
                console.log('Symbolic link created successfully.');
                console.log('Reloading NGINX...');
                return exec('sudo service nginx restart');
            })
            .then(() => {
                console.log('NGINX configuration updated and reloaded.');
            })
            .catch((error) => {
                console.error('Error:', error);
            });

        //Generate the Docker run command with dynamic values
        console.log(nginxConfigFilePath);
        const dockerRunCommand = `sudo docker run -d --restart=always -p ${selectedPort}:80 --name ${domain}-nginx-container --network net1 -v ${rootPath}:/usr/share/nginx/html nginx:latest`;

        // Execute the Docker run command
        exec(dockerRunCommand, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error creating Docker container: ${error}`);
                return res.status(500).json({ message: 'Error creating Docker container' + error });
            }

            console.log(`Docker container created successfully: ${stdout}`);
            res.status(200).json({ message: 'Docker container created successfully' });
        });
    } catch (error) {
        console.error('Error Creating Site:', error);
        res.status(500).json({ error: 'Failed to Create Container: ' + error });
    }
};


function findAvailablePort(minPort, maxPort) {
    return new Promise((resolve, reject) => {
      const server = net.createServer();
      server.unref(); // Prevent the server from keeping the Node.js process alive
  
      server.on('error', reject);
  
      server.listen(0, () => {
        const port = server.address().port;
        server.close(() => {
          resolve(port);
        });
      });
    });
  }