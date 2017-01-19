Build Dockerfile for Visual Studio remote debugging
===================================================

This is a small Node.js app for automating creation of `Dockerfile`s that can
be used to build containers which can be used for remote debugging native apps
from Visual Studio using the [*Visual C++ for Linux Development*](https://marketplace.visualstudio.com/items?itemName=VisualCPPTeam.VisualCforLinuxDevelopment) extension. To run the app do
the following:

  - Install [Docker](https://www.docker.com/products/docker)
  - Install a recent version of [Node.js](https://nodejs.org/)
  - Install [Yarn](https://yarnpkg.com/) package manager

Now open a terminal and run the following from the folder where you cloned the
repo:

```
$ yarn
$ node app.js
```

This will produce output that looks like this:

```
$ node app.js
[*] Reading Dockerfile template.
[*] Creating output folder C:\code\docker-linux-dev-image\output\HyoI9qTUe.
[*] Generating new keypair.
[*] Saving private key file.
[*] Saving public key file.
[*] Generating Dockerfile.

> The SSH keys and Dockerfile are in the folder C:\code\docker-linux-dev-image\output\HyoI9qTUe.
```

The generated `Dockerfile` along with SSH keys is dropped into the output
folder. CD into the output folder and build the Docker image the usual way:

```
$ cd output/HyoI9qTUe
$ docker build -t vsdebug .
```

If everything goes well you'll find the newly minted image in your Docker
engine. Now to run a container from this image you'd run the following command:

```
docker run -d -p 2222:22 --security-opt seccomp:unconfined vsdebug
```

This will spin a container up with an SSH server listening on local port `2222`.
You can test this out by SSHing to this server like so:

```
$ cd output/HyoI9qTUe
$ ssh -i id_rsa -p 2222 root@localhost
```

Now you should be able to remote debug your Linux apps form Visual Studio as
documented in this [blog post](https://blogs.msdn.microsoft.com/vcblog/2016/11/08/developing-linux-c-applications-with-azure-docker-containers/).