// Index des Teddy pour la page produits, affiche correctement les infos de chaque Teddy (img, description etc...)
const urlParams = new URLSearchParams(window.location.search);
const TEDDY_ID = urlParams.get('productId');

// Création des constantes pour le localStorage
const ARTICLES = 'articles';
const ORDER_INFOS = 'orderInfos';
const NUMBER_OF_ARTICLES = 'articlesQuantity';
const TOTAL_PRICE = 'totalPrice';

// Stockage du résultat du fetch de l'API
var apiDatas;

// Pour éviter d'afficher plusieurs fois le formulaire dans le panier en cas de clic répété de l'utilisateur
var formIsNotOnPage = true;

/**
 * IIFE : à chaque chargement d'une page, exécute cette fonction une fois et 
 * récupère les données de l'API puis appel une fonction propre à cette page
 */
(function fetchAPIOneTime() {
    fetch("http://localhost:3000/api/teddies")
        .then(res => res.json())
        .then(data => {
            apiDatas = data;
            switch (window.location.pathname) {
                case '/':
                    getArticlesCounter();
                    getAllTeddies();
                    break;
                case '/produit.html':
                    getArticlesCounter();
                    showProductInfos();
                    break;
                case '/panier.html':
                    getArticlesCounter();
                    validateFormAndPostToAPI();
                    getCartDatas();
                    break;
                case '/confirmation.html':
                    getConfirmPageInfos();
                    break;
                default:
                    console.error('Erreur : Page non trouvée');
                    break;
            }
        })
        .catch(error => console.error(error))
})()

/**
 * Récupération et affichage des données concernant un Teddy
 * @param {number} index - utilisé pour obtenir les données à cet index dans l'API
 */
function getTeddyInfos(index) {
    let articles = document.querySelector(`#articles`);
    let article = document.querySelector(`#article`);

    if (window.location.pathname == '/') {
        articles.innerHTML += `
        <article class="col-12 col-lg-4 mx-auto">
            <div class="card mb-4 border-primary">
            <img src="${apiDatas[index].imageUrl}" alt="teddy the bear" class="card-img-top">
            <div class="card-body">
                <h5 class="card-title text-center">${apiDatas[index].name}</h5>
                <p class="card-text text-justify">${apiDatas[index].description}</p>
            </div>
                <a href="produit.html?productId=${apiDatas[index]._id}" class="btn btn-primary mx-auto mb-3">Plus d'infos</a>
            </div>
        </article>`;
    }

    if (window.location.pathname == '/produit.html') {
        article.innerHTML = `
            <article class="card mb-4 border-primary">
                <img src="${apiDatas[index].imageUrl}" alt="teddy the bear" class="card-img-top">
                <div class="card-body text-center">
                    <h5 class="card-title text-center">${apiDatas[index].name}</h5>
                    <p class="card-text text-justify">${apiDatas[index].description}</p>
                    <div id="price"></div>
                    <button onclick="addToCart()" class="btn btn-warning mt-3 border-dark">Ajouter au panier</button>
                </div>
            </article>`;
    }
}

/**
 * Affiche les infos concernant le Teddy dont l'id est TEDDY_ID
 */
function showProductInfos() {
    let currentTeddyIndex = apiDatas.findIndex(id => id._id === TEDDY_ID);
    let colors = document.querySelector('#colors');

    if (apiDatas.find(id => id._id === TEDDY_ID) === undefined) {
        // Si l'id de l'article est introuvable, affiche un message d'erreur
        let article = document.querySelector('#article');
        article.innerHTML = `
        <h3 class='text-justify'>Nous sommes désolé mais nous ne trouvons pas l'article que vous demandez :(</h3>
            <p>Veuillez retournez à l'accueil pour faire un autre choix.</p>`;
        colors.innerHTML += `<option value="null">Article introuvable</option>`;
    } else {
        // Affiche un descriptif du produit et permet de choisir une quantité et une couleur
        getTeddyInfos(currentTeddyIndex);
        let price = document.querySelector(`#price`);
        const currentTeddy = apiDatas.find(id => id._id === TEDDY_ID)

        price.innerHTML += `
        <p class="card-text text-center font-weight-bold mx-3"><u>Prix</u> : ${currentTeddy.price/100} €</p>
        <label for="count">Nombre d'articles (minimum 1):</label>
        <input type="number" id="count" name="count" value="1" min="1">`;

        for (let i = 0; i < currentTeddy.colors.length; i++) {
            colors.innerHTML += `<option value="${currentTeddy.colors[i]}">${currentTeddy.colors[i]}</option>`;
        }
    }

}

//Charge et affiche tous les produits de l'API sur la page d'accueil
function getAllTeddies() {
    for (index in apiDatas) {
        getTeddyInfos(index);
    }
}

/**
 * Création des données persistantes localStorage
 * pour utilisation dans le panier
 */
function addToCart() {
    let currentTeddyIndex = apiDatas.findIndex(id => id._id === TEDDY_ID)
    let teddy = apiDatas[currentTeddyIndex];
    let confirmAddedToCart = document.querySelector('#addedToCart');
    let chosenColor = document.querySelector('#colors').value;
    let chosenNumOfArticles = document.querySelector('#count').value;

    // Si l'utilisateur rentre manuellement un nombre d'article 
    // inférieur ou égal à zéro dans le input -> définit 'chosenNumOfArticles' à 1
    if (chosenNumOfArticles <= 0) chosenNumOfArticles = 1;

    // Stockage des données de l'article en cours dans un objet
    let myArticle = {
        color: chosenColor,
        numberOfArticles: Number(chosenNumOfArticles),
        id: teddy._id
    };

    if (localStorage.getItem(ARTICLES) === null) {
        // Si le localStorage est vide, crée un tableau contenant l'objet myArticle et l'ajouter au localStorage
        let anArray = [];
        anArray.push(myArticle);
        localStorage.setItem(ARTICLES, JSON.stringify(anArray));
        confirmAddedToCart.innerHTML = `<p>Article ajouté à votre panier ✔️</p>`;

    } else {
        // Récupère les articles du panier
        let currentArticles = JSON.parse(localStorage.getItem(ARTICLES));

        if (currentArticles.find(element => element.id === TEDDY_ID) === undefined) {
            // Si l'id de notre produit n'existe pas encore dans le panier, l'ajoute au panier
            currentArticles.push(myArticle);

            localStorage.setItem(ARTICLES, JSON.stringify(currentArticles));

            confirmAddedToCart.innerHTML = `<p>Article ajouté à votre panier ✔️</p>`

        } else {
            if ((currentArticles.findIndex(element => element.id === TEDDY_ID && element.color === chosenColor)) == -1) {
                // Si aucun article stocké n'a l'id du produit ET la couleur choisie alors on l'ajoute au panier
                currentArticles.push(myArticle);
                localStorage.setItem(ARTICLES, JSON.stringify(currentArticles));

                confirmAddedToCart.innerHTML = `<p>Article ajouté à votre panier ✔️</p>`
            } else {
                // Si un article du panier a l'id du produit ET la couleur choisie alors lui ajouter le nombre d'article sélectionné
                let currentArticleIndex = currentArticles.findIndex(element => element.id === TEDDY_ID && element.color === chosenColor);
                currentArticles[currentArticleIndex].numberOfArticles += Number(chosenNumOfArticles);
                localStorage.setItem(ARTICLES, JSON.stringify(currentArticles));

                confirmAddedToCart.innerHTML = `<p>Article ajouté à votre panier ✔️</p>`
            }
        }
    }
    // Met à jour le nombre d'articles dans l'info-bulle du Panier dans le header
    getArticlesCounter();
}

/**
 * Récupère toutes les données nécessaires à l'affichage du panier
 * de l'utilisateur via localStorage
 */
function getCartDatas() {
    let cart = document.querySelector('#cart');
    let subTotal = document.querySelector('#subTotal');
    let subTotal2 = document.querySelector('#subTotal2');

    if (localStorage.getItem(ARTICLES) === null) {
        // Si le localStorage ne contient pas d'article -> affiche 'panier vide'
        document.querySelector('#price').hidden = true;
        cart.innerHTML = `<h4>Votre panier est vide pour le moment.</h4>
        <p>Votre panier est là pour vous servir. N'hésitez pas à parcourir notre sélection d'articles, bons achats sur Orinoco.</p>`;
    } else {
        cart.innerHTML = "";
        let cartArray = JSON.parse(localStorage.getItem(ARTICLES));
        let totalPrice = 0;

        cartArray.forEach(async function(element, index, array) {
            /**
             * Pour chaque article du panier, affiche l'image, le nom, la description, le prix total des articles sélectionnés,
             * la couleur, la quantité, pouvoir modifier la quantité et la possibilité de supprimer l'article du panier
             *  */
            try {
                let data = await getApiInfosById(element.id);

                totalPrice += Number(data.price / 100 * element.numberOfArticles);

                cart.innerHTML += `
                    <article class="row">
                        <div class="col-12 col-md-3 mx-auto">
                            <img src="${data.imageUrl}" alt="teddy the bear" class="img-thumbnail p-1 mb-3 mb-md-0 mx-auto">
                        </div>
                        <div class="col-12 col-md-9 mx-auto">
                            <div class="d-flex justify-content-between">
                                <h4>${data.name}</h4>
                                <p class="text-danger font-weight-bold">${data.price/100 * element.numberOfArticles} €</p>
                            </div>
                            <p class="mb-2 text-justify">${data.description}</p>
                            <div class="d-flex justify-content-between">
                                <p class="mb-0 small">Couleur: ${element.color}</p>
                                <div class="d-flex flex-column">
                                    <label for="quantity" class="mx-auto"><small>Quantité (minimum 1):</small></label>
                                    <input type="number" class="small" id="quantity" name="quantity" value="1" min="1">
                                    <button onclick="updateQtyValue(${index})" class="btn btn-primary btn-sm mx-auto mt-2">Mettre à jour</button>
                                </div> 
                            </div>
                            <p class="mb-2 small ">Quantité: ${element.numberOfArticles}</p>
                            <button onclick="removeArticle(${index})" class="btn btn-secondary btn-sm">Supprimer</button>
                        </div>
                    </article>
                    <hr>`;

                if (index === array.length - 1) {
                    /**
                     * Utilisation de setTimeout() pour que le callback soit exécuté en dernier étant donné
                     * qu'il s'agit d'une fonction du navigateur web qui sera exécuté dans la 'Callback Queue'
                     * et que la Callback queue n'est exécuté qu'en tout dernier quand l'Event loop est vide.
                     * Mon but ici est d'avoir un affichage correct de la valeur de totalPrice
                     */
                    setTimeout(() => {
                        let totalArticles = 0;

                        cartArray.forEach(element => {
                            totalArticles += Number(element.numberOfArticles);
                        });

                        // Récapitulatif de la somme de tous les articles à cet instant avant tous les articles
                        subTotal.innerHTML = `
                        <div class="row">
                            <div class="col-11 col-lg-4 bg-light p-3 mx-auto border rounded">
                                <h5>Sous-total (${totalArticles} ${totalArticles > 1 ? 'articles' : 'article'}) : <strong class="text-danger">${totalPrice} €</strong></h5>
                                <button onclick="showForm()" class="col-12 btn btn-warning border-dark">Passer la commande</button>  
                            </div>
                        </div>`;

                        // Récapitulatif de la somme de tous les articles à cet instant après tous les articles
                        subTotal2.innerHTML = `
                        <div class="row">
                            <div class="col-12 d-flex justify-content-around">
                                <h5>Sous-total (${totalArticles} ${totalArticles > 1 ? 'articles' : 'article'}) : <strong class="text-danger">${totalPrice} €</strong></h5>
                                <button onclick="showForm()" class="btn btn-warning border-dark">Passer la commande</button>  
                            </div>
                        </div>`;

                        // Stockage du prix total et du nombre d'articles pour la page de confirmation
                        localStorage.setItem(TOTAL_PRICE, totalPrice);
                        localStorage.setItem(NUMBER_OF_ARTICLES, totalArticles);
                    }, 50);
                }
            } catch (error) {
                console.error('Erreur: fonction getCartDatas()', error)
            }
        });
    }
}

/**
 * Récupére les infos d'un article en envoyant son id à l'API
 * @param {string} id - l'id d'un article 
 */
async function getApiInfosById(id) {
    try {
        const res = await fetch(`http://localhost:3000/api/teddies/${id}`);
        return await res.json();
    } catch (error) {
        console.error(error);
    }
}

/**
 * Si l'utilisateur clic plusieurs fois sur 'Passer la commande' -> permet 
 * d'éviter que plusieurs formulaires ne soient visibles sur la page du panier
 */
function showForm() {
    if (formIsNotOnPage) {
        let form = document.getElementById('form');
        form.hidden = false;
        form.scrollIntoView();
    }
}

/**
 * Vérification si les données du formulaire sont correctes.
 * Envoi des données à l'API et sauvegarde de la réponse dans le localStorage
 * pour utilisation dans la page de confirmation de commande.
 */
function validateFormAndPostToAPI() {
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        let badFormat = document.getElementById('badFormat');
        let firstName = document.getElementById('firstName');
        let lastName = document.getElementById('lastName');
        let address = document.getElementById('address');
        let city = document.getElementById('city');
        let email = document.getElementById('email');

        let letters = /^[A-zÀ-ú][A-zÀ-ú -]+$/;
        let lettersAndNumbers = /^[A-zÀ-ú0-9][A-zÀ-ú0-9 -]+$/;

        /**
         * Vérifie qu'il n'y a pas de caractères non autorisés dans les champs remplis par l'utilisateur,
         * et que l'utilisateur n'a pas rentré seulement le caractère espace dans l'un des champs.
         */
        if (!(firstName.value.match(letters) &&
                lastName.value.match(letters) &&
                city.value.match(letters) &&
                address.value.match(lettersAndNumbers)
            )) {
            // La bordure devient rouge pour les input où l'utilisateur n'a respecté les conditions.
            firstName.classList.remove("border-danger");
            lastName.classList.remove("border-danger");
            city.classList.remove("border-danger");
            address.classList.remove("border-danger");

            if (!firstName.value.match(letters)) {
                firstName.classList.add("border-danger");
            }
            if (!lastName.value.match(letters)) {
                lastName.classList.add("border-danger");
            }
            if (!city.value.match(letters)) {
                city.classList.add("border-danger");
            }
            if (!address.value.match(lettersAndNumbers)) {
                address.classList.add("border-danger");
            }
            // Affichage d'une alerte expliquant comment remplir le formulaire correctement
            badFormat.innerHTML = `
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                <strong>Oups, une petite erreur!</strong><br>- Les champs 'Prénom', 'Nom' et 'Ville' n'accèptent que les lettres et le tiret.<br>
                - Le champ 'Adresse' n'accèpte que les lettres, les chiffres et le tiret (attention à ne pas mettre de virgule).<br>
                - <u>Vérifiez qu'il n'y ait pas d'espace avant vos réponses dans chaque champ</u>.<br><br>
                Veuillez effectuer les modifications et appuyer de nouveau sur le bouton <strong>Acheter</strong>.
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>`;
        } else {
            // Objet contact à envoyer à l'API
            const contact = {
                firstName: firstName.value,
                lastName: lastName.value,
                address: address.value,
                city: city.value,
                email: email.value
            }

            // Création d'un tableau ne contenant que les ids des articles
            const allArticles = JSON.parse(localStorage.getItem(ARTICLES));
            let products = [];
            allArticles.forEach(element => {
                products.push(element.id);
            });

            const myOrder = { contact, products }

            fetch('http://localhost:3000/api/teddies/order', {
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json;charset=utf-8'
                    },
                    body: JSON.stringify(myOrder)
                })
                .then(function(response) {
                    return response.json();
                })
                .then(function(myJsonObj) {
                    localStorage.setItem(ORDER_INFOS, JSON.stringify(myJsonObj));
                    window.location.href = "confirmation.html";
                })
                .catch(function(error) {
                    console.error("Erreur au niveau des données dans la requête order", error);
                })
        }
    })
}

/**
 * Affichage de la confirmation de la commande, d'un récapitulatif de la commande
 * ainsi que son id récupéré de l'API et du prix total
 */
function getConfirmPageInfos() {
    let confirmPage = document.querySelector('#confirm');
    let orderInfos = JSON.parse(localStorage.getItem(ORDER_INFOS));
    let allArticles = JSON.parse(localStorage.getItem(ARTICLES));

    if (orderInfos == null) {
        // S'il n'y a aucune commande en cours, informe l'utilisateur
        document.querySelector('#commandConfirm').hidden = true;
        confirmPage.innerHTML = `
        <h2 class="text-center">Désolé, aucune commande n'est en cours, veuillez revenir à l'accueil pour effectuer vos achats.</h2><hr>`;
    } else {
        // Affichage du récapitulatif de la commande et de sa confirmation
        document.querySelector('#commandId').innerHTML = orderInfos.orderId;

        confirmPage.innerHTML = `
        <div>
            <h4 class="text-warning">Bonjour,</h4>
            Nous vous remercions de votre commande sur Orinoco. Nous vous tiendrons informés par e-mail lorsque les articles de votre commande auront été expédiés.
        </div>
        <div class="col-12 col-md-7 col-lg-6 text-center mx-auto bg-light border p-3 mt-3">
            <p>Votre commande sera expédiée à :</p>
            <strong>${orderInfos.contact.firstName} ${orderInfos.contact.lastName}</strong><br>
            <strong>${orderInfos.contact.address}</strong><br>
            <strong>${orderInfos.contact.city}</strong><br>
        </div>
        <h5 class="text-warning mt-5 mb-0 pb-0">Détails de la commande</h5>
        <hr class="mt-0 pt-0">
        <div class="d-lg-flex justify-content-between mb-5">
            <p>Commande n° <span class="text-primary">${orderInfos.orderId}</span></p>
            <p><strong>Montant total de la commande</strong> (${localStorage.getItem(NUMBER_OF_ARTICLES)} ${localStorage.getItem(NUMBER_OF_ARTICLES) > 1 ? 'articles' : 'article'}) : <strong class="text-danger">${localStorage.getItem(TOTAL_PRICE)} €</strong></p>
        </div>`;

        orderInfos.products.forEach(function(element, index, array) {
            confirmPage.innerHTML += `
            <article class="row">
                <div class="col-12 col-md-3 mx-auto">
                    <img src="${element.imageUrl}" alt="teddy the bear" class="img-thumbnail p-1 mb-3 mb-md-0 mx-auto">
                </div>
                <div class="col-12 col-md-9 mx-auto">
                    <div class="d-flex justify-content-between">
                        <h4>${element.name}</h4>
                        <p class="text-danger font-weight-bold">${element.price/100 * allArticles[index].numberOfArticles} €</p>
                    </div>
                    <p class="mb-2 text-justify">${element.description}</p>
                    <div class="d-flex justify-content-between">
                        <p class="mb-0 small">Couleur: ${allArticles[index].color}</p>
                    </div>
                    <p class="mb-2 small ">Quantité: ${allArticles[index].numberOfArticles}</p>
                </div>
            </article>
            <hr>`;

            if (index === array.length - 1) {
                confirmPage.innerHTML += `
            <p class="float-right"><strong>Montant total de la commande</strong> (${localStorage.getItem(NUMBER_OF_ARTICLES)} ${localStorage.getItem(NUMBER_OF_ARTICLES) > 1 ? 'articles' : 'article'}) : <strong class="text-danger">${localStorage.getItem(TOTAL_PRICE)} €</strong></p>
            <p class="mt-5">Nous espérons vous revoir bientôt.</p>
            <h4>Orinoco</h4>`;
            }
        });

        // Suppression des éléments du localStorage ce qui vide le panier
        [ARTICLES, ORDER_INFOS, NUMBER_OF_ARTICLES, TOTAL_PRICE].forEach(element => localStorage.removeItem(element));
    }


}

/**
 * Supprime l'article à l'emplacement : index, puis met à jour le localStorage
 * @param {number} index - index de l'élement à supprimer dans le tableau des articles
 */
function removeArticle(index) {
    let cartArticles = JSON.parse(localStorage.getItem(ARTICLES));
    cartArticles.splice(index, 1);
    localStorage.setItem(ARTICLES, JSON.stringify(cartArticles));

    if (cartArticles.length == 0) {
        /**
         * S'il n'y a plus d'article dans le panier alors
         * Suppression du contenu des <div> affichant le sous-total du prix du panier
         * et des éléments du localStorage ce qui vide le panier
         *  */
        document.querySelector('#subTotal').innerHTML = "";
        document.querySelector('#subTotal2').innerHTML = "";

        [ARTICLES, NUMBER_OF_ARTICLES, TOTAL_PRICE].forEach(element => localStorage.removeItem(element));
    }

    getCartDatas();
    getArticlesCounter();
}

/**
 * Modifie la quantité d'achat d'un article
 * @param {numer} index - index de l'élement où la quantité doit être modifié
 */
function updateQtyValue(index) {
    let qtySelector = document.querySelector(`#quantity`);
    if (qtySelector.value < 1) qtySelector.value = 1;

    let cartArticles = JSON.parse(localStorage.getItem(ARTICLES));

    cartArticles[index].numberOfArticles = Number(qtySelector.value);
    localStorage.setItem(ARTICLES, JSON.stringify(cartArticles));
    getCartDatas();
    getArticlesCounter();
}

/**
 * Affiche une info-bulle dans le header indiquant le nombre actuel d'articles dans le panier.
 * N'affiche pas l'info-bulle si le panier est vide.
 */
function getArticlesCounter() {
    let articles = JSON.parse(localStorage.getItem(ARTICLES))
    let counter = document.querySelector('#cartCounter');
    let totalCurrentArticles = 0;

    if (articles != null) {
        articles.forEach(element => {
            totalCurrentArticles += element.numberOfArticles;
        });
    }

    if (totalCurrentArticles > 0) {
        counter.hidden = false;
        counter.innerHTML = totalCurrentArticles;
    } else {
        counter.hidden = true;
    }
}