# Development

Before you can build this project, you must install and configure the following dependencies on your machine:

1. [Node.js][]: We use Node to run a development web server and build the project.
   Depending on your system, you can install Node either from source or as a pre-packaged bundle.

After installing Node, you should be able to run the following command to install development tools.
You will only need to run this command when dependencies change in [package.json](package.json).

    npm install

We use npm scripts and [Webpack][] as our build system.

Run the following commands in two separate terminals to create a blissful development experience where your browser
auto-refreshes when files change on your hard drive.

    ./mvnw
    npm start

Npm is also used to manage CSS and JavaScript dependencies used in this application. You can upgrade dependencies by
specifying a newer version in [package.json](package.json). You can also run `npm update` and `npm install` to manage dependencies.
Add the `help` flag on any command to see how you can use it. For example, `npm help update`.

The `npm run` command will list all of the scripts available to run for this project.

# Deploying with Kubernetes

## Preparation
Generate Docker images by running the following command
in the invoice, notification, and notification directories.
```
mvnw package -Pprod -DskipTests jib:dockerBuild
```

To generate the missing Docker image(s), please run:
```
mvnw package -Pprod -DskipTests jib:dockerBuild in D:\code-jhipster\e-commerce-microservice\notification
mvnw package -Pprod -DskipTests jib:dockerBuild in D:\code-jhipster\e-commerce-microservice\invoice
mvnw package -Pprod -DskipTests jib:dockerBuild in D:\code-jhipster\e-commerce-microservice\notification
```

You will need to push your image to a registry. If you have not done so, use the following commands to tag and push the images:

```
$ docker image tag notification ustcck/notification
$ docker push ustcck/notification
$ docker image tag invoice ustcck/invoice
$ docker push ustcck/invoice
$ docker image tag notification ustcck/notification
$ docker push ustcck/notification
```

Alternatively, use Jib to build and push image directly to a remote registry:
```
mvnw package -Pprod -DskipTests jib:build -Djib.to.image=ustcck/notification:2.0.0 in D:\code-jhipster\e-commerce-microservice\notification
mvnw package -Pprod -DskipTests jib:build -Djib.to.image=ustcck/invoice:2.0.0 in D:\code-jhipster\e-commerce-microservice\invoice
mvnw package -Pprod -DskipTests jib:build -Djib.to.image=ustcck/notification:2.0.0 in D:\code-jhipster\e-commerce-microservice\notification
```

## Deployment

You can deploy all your apps by running the below bash command:

```
./kubectl-apply.sh
```


## Exploring your services

Use these commands to find your application's IP addresses:

```
$ kubectl get svc notification
```

## Scaling your deployments

You can scale your apps using

```
$ kubectl scale deployment <app-name> --replicas <replica-count>
```

## zero-downtime deployments

The default way to update a running app in kubernetes, is to deploy a new image tag to your docker registry and then deploy it using

```
$ kubectl set image deployment/<app-name>-app <app-name>=<new-image>
```

Using livenessProbes and readinessProbe allow you to tell Kubernetes about the state of your applications, in order to ensure availablity of your services. You will need minimum 2 replicas for every application deployment if you want to have zero-downtime deployed. This is because the rolling upgrade strategy first kills a running replica in order to place a new. Running only one replica, will cause a short downtime during upgrades.

## Monitoring tools

### JHipster console

Your application logs can be found in JHipster console (powered by Kibana). You can find its service details by

```
$ kubectl get svc jhipster-console
```

- If you have chosen _Ingress_, then you should be able to access Kibana using the given ingress domain.
- If you have chosen _NodePort_, then point your browser to an IP of any of your nodes and use the node port described in the output.
- If you have chosen _LoadBalancer_, then use the IaaS provided LB IP

## JHipster registry

The registry is deployed using a headless service in kubernetes, so the primary service has no IP address, and cannot get a node port. You can create a secondary service for any type, using:

```
$ kubectl expose service jhipster-registry --type=NodePort --name=exposed-registry
```

and explore the details using

```
$ kubectl get svc exposed-registry
```

For scaling the JHipster registry, use

```
$ kubectl scale statefulset jhipster-registry --replicas 3
```

## Troubleshooting

> my apps doesn't get pulled, because of 'imagePullBackof'

Check the docker registry your Kubernetes cluster is accessing. If you are using a private registry, you should add it to your namespace by `kubectl create secret docker-registry` (check the [docs](https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/) for more info)

> my applications get killed, before they can boot up

This can occur if your cluster has low resource (e.g. Minikube). Increase the `initialDelaySeconds` value of livenessProbe of your deployments

> my applications are starting very slow, despite I have a cluster with many resources

The default setting are optimized for middle-scale clusters. You are free to increase the JAVA_OPTS environment variable, and resource requests and limits to improve the performance. Be careful!
