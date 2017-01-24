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

### Introduction

Ce projet a pour but de permettre à un utilisateur de minifier ces urls afin de pouvoir les partagers plus facilement. 
De plus il permet aussi d'uploader des images, bien entendu le liens pour acceder aux images uploader ont été minifier.

### Choix des apis

1.  Auth0: J'utilise cette api afin de pouvoir authentifier mon utilisateur. Grâce à cette api je n’ai pas besoins d’implémenter mon propres système d’authentifications. 
    De plus les utilisateurs peuvent s’authentifier avec leurs comptes (Google, Facebook …).

2.  Uploadcare : Cette API  permet d’uploader des images / (fichiers offre payante (ou inscription d'une CB)).
    Grâce à cette api je n’ai plus besoins de me soucier de la disponibilité du serveurs (le web service). Les clients auront toujours accès à leurs images uploader.
    De plus le web service peux être déployé en locale mais toutes les images déployées seront disponibles sur internet (puisque déployé par l’api).

3.  Bitly : Cette api permet de réduire la taille des urls afin de faciliter leurs mémorisations / partages. 
    Par exemple : Il est plus facile de ce rappeler de cette url :  <http://bit.ly/2kfrmAB> que de celle-ci : <https://uploadcare.com/documentation/rest/>. 
    Les raisons pour lequel j’ai choisi cette api c’est que lorsque j’upload une image avec Uploadcare l’url générée et très longues ce qui rend difficile sont partage par orale. 
    De ce fait lorsque l’utilisateur upload une image l’url générée et donnée à l’api Bitly afin de pouvoir ensuite partager ce lien.

### Fonctionnement

Ce web service fait office de proxy entre les différentes api.

Fonctionnement : Client - Web Service.

1.  Le client s’authentifie à l’aide de auth0. Il reçois un JWT token.
2.  Le client peux ensuite effectuer ces appels au web services.
    -   Le web service vérifie le token
    -   Le web services effectue les appels aux différentes apis (Uploader, Bitly) et réponds aux requêtes du client
3.  Le client reçois ces infos.

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

### Gestion des erreurs

-   Due au limitation de l'api les fichiers envoyé sont vérifié afin de déterminier si ce sont des images. (/utils/FileValidator).
-   La limite en taille des fichiers et de 5MB

### Bugs / Limitations

-   Uploadcare:
    -   Limite de la version gratuite : je ne peux uploader que des images.
    -   Suppression : La suppression prend plusieurs heures (suppression de l’image uploader). >48H
-   Bitly :

    -   Les liens ne peuvent être supprimé du compte. (Uniquement avec la version gratuite).

-   Interface utilisateur:
    -   Filtrer par extension (que des images) les fichiers uploader  (pour le moment aucun filter au niveau de la GUI).
    -   Redirection de l'utilisateur sur la page /home.
    -   Lorsque le token expire : Il faut supprimer le token et inviter l'utilisateur a ce re-authentifier.

### Liens

[Bitly API](http://dev.bitly.com/get_started.html)

[Uploadcare](https://uploadcare.com/documentation/)

[Auth0](https://auth0.com/)

[flux-architecture](https://scotch.io/tutorials/getting-to-know-flux-the-react-js-architecture)

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.
