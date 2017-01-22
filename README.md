# Uploader Web Service

## Running

Install the dependencies.

```bash
npm install
```

Rename `config.json.example` to `config.json` and replace the values for (`AUTH0`) => `SECRET`, `CLIENT_ID` with your Auth0 credentials. 
If you don't yet have an Auth0 account, [sign up](https://auth0.com/signuo) for free.

```bash
# copy configuration and replace with your own
cp config.json.example config.json
```

Run the app.

```bash
npm start
```

The app will be served at `localhost:3001`.

## Documentations

Ce web service fait office de proxy entre les différentes api. 

Fonctionnement : Client - Web Service.

1.  Le client s’authentifie à l’aide de auth0. Il reçois un JWT token.
2.  Le client peux ensuite effectuer ces appels au web services.
    - Le web service vérifie le token
    - Le web services effectue les appels aux différentes apis (Uploader, Bitly) et réponds aux requêtes du client
3.  Le client recois ces infos.

Pour résumer : Le client communique une seule fois à l’API auth0 afin de recevoir sont token. Une fois que le client possède le token il n’as plus besoins de communiquer avec l’api AUTH0. Toutes les autres communications ce font entre le client et le web service. (à l’exception du moment ou le token arrive a expiration) .

Le client doit être authentifier à l’aide de l’api Auth0 avant de pouvoir faire ces requêtes au web service. 
Le web service RESTFull met à disposition ces routes :

| Method | URI                   | Description                                                                                                          | Params / Body params                       |
| ------ | --------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| GET    | /api/v1/bitly         | Récupère tous les liens raccourci par l’utilisateur.                                                                 | -                                          |
| GET    | /api/v1/bitly/info    | Récupère toutes les statistiques pour un lien raccourci (nombre de cliques total ainsi qu'une distinction par pays). | url: bitly url                             |
| POST   | /api/v1/bitly/shorten | Permet de réduire une url                                                                                            | Body params : - long_url : url a réduire   |
| GET    | /api/v1/files         | Récupère tous les liens raccourci pour les images uploader                                                           | -                                          |
| POST   | /api/v1/files         | Permet d'uploader une image                                                                                          | Body params : - file : le fichier uploader |
| DELETE | /api/v1/files/{uuid}  | Permet de supprimer une image                                                                                        | {uuid} : uuid du fichier (PK)              |

### Liens

[Bitly API](http://dev.bitly.com/get_started.html)

[Uploadcare](https://uploadcare.com/documentation/)

[Auth0](https://auth0.com/)

[flux-architecture](https://scotch.io/tutorials/getting-to-know-flux-the-react-js-architecture)

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.
