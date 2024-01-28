To create a database first pull the image of the 'postgres' and then create a volume 'mernpgdata' for persistant storage and then to create a container run the below command

docker run --rm --name mernpg-container -e POSTGRES_USER=root -e POSTGRES_PASSWORD=root -v mernpgdata:/var/lib/postgresql/data -p 5432:5432 -d postgres
