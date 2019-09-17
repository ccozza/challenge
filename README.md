**Challenge**
-

This challenge was made using **Docker**, **NodeJS**, **Mongodb** and a simple micro-services design.

We have a Gateway which is going to route requests to the Tasks service, a dedicated service to handle CRUD operations for Tasks. The gateway also holds the Auth, so every request should first pass in the gateway validation. To not take too much time, I did not put into the container the iptables rules to prevent external access inside the tasks container. But in a real world scenario it would only receive requests from the gateway address.

Since Mongodb takes some time to be running, the services will be trying to connect to it. If they cannot connect to mongo at first time they will be restarting until mongodb is available. So do not mind if the containers are restarting by some errors related to mongo at the startup. This is configured to restart always and will be running in a few seconds.

I also did some simple tests, I did not spent too much time on the tests due to the time limitation of the challenge.

To run the whole application, go to the root directory of the challenge and run `npm install` for gateway, tasks and tests. After that, go to the root directory of the challenge and run:
```
docker-compose up --build
```

You should have the application running at the 3050 Port.

**Tests**
-

I always run tests in a dedicated environment, that's why we have another docker-compose for tests. To run the tests, make sure you have the application stopped. You can do this by running:
```
docker-compose stop
```

After that, go to tests directory and run again the `docker-compose up --build`, it will put the test containers running, so now go to another terminal, and inside the tests directory, run `npm run test`.

**Future Implementations**
-

Would be nice if a real world application to have mongodb using replicas, for example one arbiter and two instances of mongo, we could use one for write and one for read. It can improve performance in this kind of application. We could also use cache system like Redis.

I cannot forget about prometheus, it's an amazing tool to collect metrics of the application, and if in a real world scenario it would be perfect.