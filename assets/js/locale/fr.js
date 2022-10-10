Translation =  function ()
{
	this.get = () =>
	{
		var LANG = 
		{
			lang: "fr",
			views: 
			{
				pages: 
				{
					all_suppliers: {
						sectionTitle: "Centres ou cliniques enregistrés",
						btn01: "Supprimer la sélection",
						ph01: "Entrez des mots-clés pour rechercher...",
					},
					add_suppliers: {
						sectionTitle: "",
						form01: {
							label01: "Le nom",
							label02: "numéro de téléphone (1)",
							label03: "numéro de téléphone (2)",
							label04: "numéro de téléphone (3)",
							label05: "address",
							label06: "E-mail (1)",
							label07: "E-mail (2)",
							label08: "E-mail (3)",
							label09: "photo de profil (optionnel)",
							submitBTN01: "Enregistrer les modifications"
						}
					},
					unseen_members: {
						sectionTitle: "",
						btn01: "Supprimer la sélection",
						ph01: "Entrez des mots-clés pour rechercher..."
					},
					all_videos: {
						sectionTitle: "",
						btn01: "Supprimer la sélection",
						ph01: "Entrez des mots-clés pour rechercher..."
					},
					add_videos: {
						sectionTitle: "",
						form01: {
							label01: "Titre de la vidéo",
							label02: "Brève description",
							label03: "lien vidéo",
							label04: "Aperçu en direct",
							submitBTN01: "Enregistrer les modifications"
						}
					},
					all_testimonials: {
						sectionTitle: "",
						ph01: "Entrez des mots-clés pour rechercher...",
						btn01: "Supprimer la sélection"
					},
					advertisements_clients: {
						sectionTitle: "",
						ph01: "Entrez des mots-clés pour rechercher...",
						text01: "sélectionner à partir de",
						text02: "sélectionner pour",
						btn01: "Supprimer la sélection"
					},
					all_advertisements: {
						sectionTitle: "",
						ph01: "Entrez des mots-clés pour rechercher...",
						text01: "Filtrer par date",
						btn01: "Supprimer la sélection"
					},
					add_advertisements: {
						sectionTitle: "",
						form01: {
							label01: "Type de publicité",
							label02: "Donnez un nom propre",
							label03: "Actif jusqu'à",
							label04: "Téléchargez une image d'une taille appropriée pour le type d'affichage",
							label05: "Est-il en mode actif ?",
							submitBTN01: "Enregistrer les modifications"
						}
					},
					all_reports: {
						sectionTitle: "",
						ph01: "Entrez des mots-clés pour rechercher...",
						btn01: "Supprimer la sélection",
						text01: "Sélectionner à partir de la date",
						text02: "Sélectionner jusqu'à la date",
						th01: "Rapport sur",
						th02: "auteur du rapport",
						th03: "Nom du rapport",
						th04: "date et l'heure"
					},
					add_reports: {
						sectionTitle: "",
						form01: {
							label01: "Sélectionnez le patient",
							label02: "Donner un titre au rapport",
							label03: "Contenu du rapport",
							label04: "Sélectionnez la date",
							label05: "Sélectionnez le temps",
							submitBTN01: "Enregistrer les modifications",
							ph01: "Entrez des mots-clés pour rechercher..."
						}
					},
					revenue_and_accumulation: {
						sectionTitle: "",
						label01: "Sélectionnez le centre ou la clinique",
						label02: "Sélectionnez la date",
						text01: "aujourd'hui",
						text02: "Revenus",
						text03: "ordres",
						text04: "hier",
						text05: "Semaine",
						text06: "ce mois",
						text07: "cette année"
					},
					send_products_to_centers: {
						sectionTitle: "",
						form01: {
							label01: "Sélectionnez le centre ou la clinique",
							label02: "Sélectionnez le produit",
							submitBTN01: "Enregistrer les modifications",
							btn01: "ajouter un produit",
							ph01: "Entrez des mots-clés pour rechercher..."
						}
					},
					products_stats: {
						sectionTitle: "",
						ph01: "Entrez des mots-clés pour rechercher...",
						label01: "Sélectionnez le centre ou la clinique"
					},
					all_employees_cashout_records: {
						sectionTitle: '',
						ph01: "Entrez des mots-clés pour rechercher...",
						label01: "A partir de la date de",
						label02: "à la date",
						th01: "Nom de l'employé",
						th02: "Poste CCP",
						th03: "Le montant payé",
						th04: "payé en"
					},
					employees_accounting: {
						sectionTitle: '',
						form01: {
							label01: "identification des employés",
							label02: "le montant",
							label03: "Date de paiement",
							label04: "Temps de paiement",
							ph01: "Entrez des mots-clés pour rechercher...",
							submitBTN01: "Enregistrer les modifications"
						}
					},
					all_products_invoices: {
						sectionTitle: "factures de produits",
						ph01: "Recherche...",
						text01: "Sélectionner à partir de la date",
						text02: "Sélectionner jusqu'à la date",
						th01: "ID de facture",
						th02: "Créé en",
						th03: "payé en",
						th04: "Montant total",
						th05: "le client",
						th06: "Le montant payé",
						btn01: "Supprimer la sélection",
						label01: "Sélectionnez la clinique ou le centre"
					},
					all_clinics: {
						sectionTitle: "Centres ou cliniques enregistrés",
						btn01: "Supprimer la sélection",
						ph01: "Entrez des mots-clés pour rechercher...",
					},
					add_clinics: {
						sectionTitle: "Ajouter des comptes de centre",
						form01: {
							label01: "Le nom de la clinique ou du centre",
							label02: "téléphone",
							label03: "Mot de passe",
							label04: "l'état",
							label05: "Municipal",
							label06: "l'adresse",
							submitBTN01: "Enregistrer les modifications"
						}
					},
					billings_waiting_approval: {
						sectionTitle: "Factures en attente d'approbation",
						ph01: "Recherche...",
						text01: "Sélectionner à partir de la date",
						text02: "Sélectionner jusqu'à la date",
						th01: "ID de facture",
						th02: "Créé en",
						th03: "payé en",
						th04: "Montant total",
						th05: "le client",
						th06: "Le montant payé",
						btn01: "Supprimer la sélection"
					},
					employees_attendance: {
						sectionTitle: "Enregistrement des présences des employés",
						btn01: "Supprimer la sélection",
						ph01: "Entrez des mots-clés pour rechercher...",
						th01: "Nom de l'employé",
						th02: "Présence",
						th03: "Observation",
						th04: "date et l'heure",
						text01: "Enregistrement de la présence des employés de l'organisation",
						text02: "Sélectionner à partir de la date",
						text03: "Sélectionner à ce jour"
					},
					all_employees: {
						sectionTitle: "Employés inscrits",
						btn01: "Supprimer la sélection",
						ph01: "Entrez des mots-clés pour rechercher...",
						th01: "Nom de l'employé",
						th02: "le téléphone",
						th03: "l'adresse",
						th04: "l'état",
						th05: "Lieu de naissance",
						th06: "Date de naissance",
						th07: "Un salaire",
						th08: "Mot de passe",
						th09: "date de l'inscription",
						th10: "type",
						label01: "Sélectionnez la clinique ou le centre"
					},
					add_employees: {
						sectionTitle: "Ajouter des employés",
						form01: {
							label01: "Nom de l'employé",
							label02: "le téléphone",
							label03: "l'adresse",
							label04: "l'état",
							label05: "Date de naissance",
							label06: "Lieu de naissance",
							label07: "Mot de passe",
							label08: "salaire mensuel",
							label09: "Sélectionnez le type d'employé",
							label10: "Sélectionnez la clinique ou le centre",
							label11: "Poste CCP",
							submitBTN01: "Enregistrer les modifications"
						}
					},
					treasury_cashouts: {
						btn01: "Supprimer la sélection",
						label01: "Filtrer par dates",
						label02: "Sélectionnez la clinique ou le centre",
						th01: "Montant d'entrée",
						th02: "Quantité de sortie",
						th03: "la raison",
						th04: "Observation",
						th05: "date et l'heure"
					},
					add_to_treasury: {
						sectionTitle: "Ajouter ou dépenser du trésor",
						label01: "Le processus d'ajout ou de décaissement du Trésor ?",
						label02: "Sélectionnez la clinique de destination",
						ph01: "Tapez les mots-clés à rechercher...",
						select01: {
							option01: "Ajout au trésor",
							option02: "Sortir du trésor"
						},
						form01: {
							label01: "Montant d'entrée",
							label02: "la raison",
							label03: "Observation",
							label04: "Sélectionnez la date",
							label05: "régler le temps",
							label06: "téléverser un fichier (optionnel)",
							submitBTN01: "Enregistrer les modifications"
						},
						form02: {
							label01: "Montant dépensé",
							label02: "la raison",
							label03: "Observation",
							label04: "Sélectionnez la date",
							label05: "régler le temps",
							label06: "téléverser un fichier (optionnel)",
							submitBTN01: "Enregistrer les modifications"
						}
					},
					statistics: {
						text01: "Trésorerie",
						text02: "Au cours des 7 derniers jours",
						text03: "Les patients",
						text04: "Pourcentage",
						text05: "Rendez-vous",
						text06: "Le magasin",
						text07: "Factures",
						text08: "Des ordonnances",
						text09: "Général",
						text10: "Suivre",
						text11: "Tout",
						text12: "par date",
						text13: "Dépenses",
						text14: "ajouté au trésor",
						text15: "tiré du trésor",
						currency: 'DA',
						label01: "Sélectionnez la clinique pour voir ses statistiques",
						label02: "Choisissez l'année",
						ph01: "Entrez des mots-clés pour rechercher..."
					},
					patients_stats: {
						sectionTitle: "",
						text01: "La plus grosse perte de poids",
						text02: "Plus gros gain de poids",
						text03: "Abonné le plus âgé",
						text04: "Abonné le plus jeune en âge",
						label01: "Sélectionnez le centre ou la clinique"
					},
					all_products_billings: {
						sectionTitle: "Factures des produits vendus",
						ph01: "Recherche...",
						text01: "Sélectionner à partir de la date",
						text02: "Sélectionner jusqu'à la date",
						th01: "ID de facture",
						th02: "Créé en",
						th03: "payé en",
						th04: "Montant total",
						th05: "le client",
						th06: "Le montant payé",
						th07: "Statut de la commande",
						th08: "le fournisseur",
						btn01: "Supprimer la sélection"
					},
					sell_products: {
						sectionTitle: "Vente des produits de la pharmacie de la clinique",
						btn01: "Supprimer la sélection",
						ph01: "Entrez des mots-clés pour rechercher...",
						label01: "Sélectionnez la clinique ou le centre",
					},
					all_products: {
						sectionTitle: "Produits enregistrés",
						btn01: "Supprimer la sélection",
						ph01: "Entrez des mots-clés pour rechercher...",
						label01: "Sélectionnez la clinique ou le centre",
						th01: "Image",
						th02: "Le nom",
						th03: "le prix",
						th04: "Quantité"
					},
					add_products: {
						sectionTitle: "ajouter des produits",
						form01: {
							label01: "nom du produit",
							label02: "Brève description",
							label03: "le prix",
							label04: "Quantité",
							label05: "Choisissez une photo",
							label06: "Scannez le code-barres",
							label07: "Sélectionnez la clinique ou le centre",
							label08: "Sélectionner le fournisseur",
							btn01: "ajouter un produit",
							ph01: "Entrez des mots-clés pour rechercher...",
							submitBTN01: "Enregistrer les modifications"
						}
					},
					general_apt_waiting_approval: {
						sectionTitle: "",
						th01: "la clinique",
						th02: "service de traitement",
						th03: "le patient",
						th04: "Observation",
						th05: "date et l'heure",
						th06: "le prix",
						th07: "Le rendez-vous",
						btn01: "Supprimer la sélection",
						ph01: "Entrez des mots-clés pour rechercher...",
						label01: "Sélectionnez le centre ou la clinique",
						label02: "Sélectionnez la clinique",
						text01: "Filtrer par dates"
					},
					all_appointements: {
						sectionTitle: "Rendez-vous enregistrés",
						th01: "la clinique",
						th02: "service de traitement",
						th03: "le patient",
						th04: "Observation",
						th05: "date et l'heure",
						th06: "le prix",
						th07: "Le rendez-vous",
						btn01: "Supprimer la sélection",
						ph01: "Entrez des mots-clés pour rechercher...",
						label01: "Sélectionnez le centre ou la clinique",
						label02: "Sélectionnez la clinique",
						text01: "Filtrer par dates"
					},
					set_clients_for_appointment_sessions:{
						sectionTitle: "",
						ph01: "Entrez des mots-clés pour rechercher..."
					},
					add_appointement: {
						sectionTitle: "Ajouter des rendez-vous",
						form01: {
							label01: "Sélectionnez la section de traitement",
							label02: "Sélectionnez le patient",
							label03: "Observation",
							label04: "Date",
							label05: "le temps",
							label06: "Sélectionnez la clinique",
							label07: "Sélectionnez les sessions",
							label08: "le prix",
							label09: "Nom du rendez-vous",
							ph01: "Entrez des mots-clés pour rechercher...",
							ph02: "Nom de session...",
							submitBTN01: "Enregistrer les modifications"
						}
					},
					all_treatment_classes: {
						sectionTitle: "Sections enregistrées",
						th01: "la clinique",
						th02: "Nom du département",
						th03: "Brève description",
						btn01: "Supprimer la sélection",
						ph01: "Entrez des mots-clés pour rechercher...",
						label01: "Sélectionnez le centre ou la clinique"
					},
					add_treatment_classes: {
						sectionTitle: "Ajouter des sections de traitement",
						form01: {
							label01: "le prix",
							label02: "Nom du département",
							label03: "Brève description de la section",
							ph01: "Entrez des mots-clés pour rechercher...",
							submitBTN01: "Enregistrer les modifications"
						}
					},
					inbox: {
						sectionTitle: "boite de réception",
						form01: {
							label01: "Poster une réponse au message",
							ph01: "Rédigez une courte réponse ici...",
							text01: "total des réponses",
							submitBTN01: "ajouter une réponse"
						},
						ttip01: "supprimer les messages !",
						ttip02: "Marquer les messages comme lus",
						ph01: "Entrez des mots-clés pour rechercher..."
					},
					sent: {
						sectionTitle: "envoyée",
						form01: {
							label01: "Poster une réponse au message",
							ph01: "Rédigez une courte réponse ici...",
							text01: "total des réponses",
							submitBTN01: "ajouter une réponse"
						},
						ttip01: "supprimer les messages !",
						ttip02: "Marquer les messages comme lus",
						ph01: "Entrez des mots-clés pour rechercher..."
					},
					send_message: {
						sectionTitle: "envoyer un message",
						form01: {
							label01: "Sélectionnez le destinataire du message",
							label02: "le sujet",
							label03: "De quoi parle le message ?",
							label04: "Numéro de chef d'entreprise",
							label05: "Téléphone de l'employé",
							ph01: "Écrivez l'objet du message...",
							ph02: "Rédigez le contenu du message...",
							ph03: "Entrez des mots-clés pour rechercher...",
							submitBTN01: "envoyer le message"
						},
						link01: "Envoyer un message à un employé",
						link02: "envoyer des messages aux patients"
					},
					all_viewed_presc:
					{
						sectionTitle: "Prescriptions médicales affichées",
						th01: "#",
						th02: "lien de page",
						th03: "Date créée",
						th04: "Afficher"
					},
					add_patients: 
					{
						sectionTitle: 'enregistrement des patients',
						form01: {
							label01: "le nom complet",
							label02: "Numéro de téléphone",
							label03: "Codebar",
							label04: "l'âge",
							label05: "le genre",
							label06: "l'adresse",
							label07: "Mot de passe du compte patient",
							label08: "posture",
							label09: "WhatsApp",
							label10: "Facebook",
							label11: "Nombre d'enfants",
							label12: "circonférence du corps",
							label13: "Lieu de naissance",
							label14: "Remarques",
							label15: "Date de naissance",
							label16: "le poids",
							label17: "Diabète",
							label18: "Pression artérielle",
							label19: "Code QR",
							label20: "Telegram",
							label21: "Maladie chronique",
							select01: {
								option01: "le mâle",
								option02: "le femelle"
							},
							select02: {
								option01: "oui",
								option02: "non"
							},
							select03: {
								option01: "oui",
								option02: "non"
							},
							select04: {
								option01: "oui",
								option02: "non"
							},
							select05: {
								option01: "célibataire",
								option02: "marié",
								option03: "divorcé",
								option04: "veuf"
							},
							submitBTN01: "Enregistrement de données"
						},
						label01: "Sélectionnez la clinique ou le centre"
					},
					all_patients: 
					{
						sectionTitle: "Malades enregistrés",
						btn01: "Supprimer la sélection",
						btn02: "Pression artérielle",
						btn03: "quantité de sucre",
						btn04: "le poids",
						btn05: "périmètre pelvien",
						btn06: "Enregistrement des informations sur les maladies chroniques (tension artérielle, glycémie, taux d'insuline...)",
						btn07: "Ajouter et rembourser la dette",
						btn08: "Enregistrement des poids (poids, tour de ventre, tour de poitrine...)",
						btn09: "Insuline",
						btn10: "circonférence de la poitrine",
						btn11: "Circonférence du bras",
						btn12: "TSH",
						btn13: "HBA1c",
						btn14: "VS",
						btn15: "CRP",
						link01: "Afficher plus",
						ph01: "Entrez des mots-clés pour rechercher...",
						th01: "la pression",
						th02: "date de l'inscription",
						th03: "quantité de sucre",
						th04: "le poids",
						th05: "circonférence abdominale",
						th06: "quantité",
						form01: {
							label01: "Pression artérielle",
							label02: "quantité de sucre",
							label03: "le poids",
							label04: "circonférence abdominale",
							label05: "La date à laquelle les informations ont été enregistrées",
							label06: "Temps d'enregistrement des informations",
							label07: "téléverser un fichier (optionnel)",
							label08: "pourcentage d'insuline",
							label09: "pourcentage de TSH",
							label10: "pourcentage HBA1c",
							label11: "pourcentage VS",
							label12: "pourcentage CRP",
							submitBTN01: "Enregistrer les modifications"
						},
						form02: {
							label01: "Valeur de la dette",
							ph01: "Entrez la valeur de la dette...",
							submitBTN01: "Paiement",
							submitBTN02: "ajouter"
						},
						form03: {
							label01: "le poids",
							label02: "circonférence abdominale",
							label03: "circonférence de la poitrine",
							label04: "circonférence du bras"
						},
						label01: "Sélectionnez la clinique ou le centre"
					},
					settings:
					{
						sectionTitle: "Réglages",
						btn01: "Paramètres du compte",
						form01: {
							label01: "Prenom",
							label02: "l'état",
							label03: "Municipal",
							label04: "l'adresse",
							label05: "le téléphone",
							label06: "Mot de passe",
							label07: "Confirmez le mot de passe",
							label08: "nom du docteur",
							label09: "l'âge",
							label10: "le genre",
							label11: "Whatsup",
							label12: "Facebook",
							label13: "les enfants",
							label14: "circonférence du corps",
							label15: "lieu de naissance",
							label16: "Date de naissance",
							label17: "le poids",
							label18: "Diabète",
							label19: "Pression artérielle",
							label20: "Nom de l'entreprise",
							label21: "Nom d'utilisateur",
							select01: {
								option01: "le male",
								option02: "le femelle"
							},
							submitBTN01: "Mettre à jour les paramètres"
						},
						form02:
						{
							label01: "Sélectionnez la langue d'affichage",
							submitBTN01: "Mettre à jour les paramètres"
						},
						btn02: "Paramètres d'affichage"
					},
					add_prescription:
					{
						sectionTitle: "Ajouter une ordonnance",
						label01: "Sélectionnez la clinique ou le centre",
						form01: {
							label01: "poids du patient",
							label02: "Ajouter des médicaments",
							label03: "Code QR",
							label04: "Sélectionnez le patient",
							label05: "Observation",
							btn01: "Cliquez ici pour ajouter",
							ph01: "nom du médicament",
							ph02: "Dosage",
							ph03: "Durée",
							ph04: "A la recherche de malades...",
							ph05: "Quantité",
							ph06: "Recherche d'un produit...",
							submitBTN01: "La sauvegarde des données"
						},
						text01: "Ordonnance intérieure",
						text02: "Ordonnance externe"
					},
					all_prescriptions: 
					{
						sectionTitle: "Toutes les prescriptions médicales enregistrées",
						btn01: "Supprimer la sélection",
						ph01: "Entrez des mots-clés pour rechercher..."
					}
				},
				dialogs:
				{
					dialog_box:{
						btn01: "Fermer"
					},
					promptConfirmDialog:
					{
						btn01: "Bien",
						btn02: "Fermer"
					},
					promptInputDialog:
					{
						btn01: "Bien",
						btn02: "Fermer"
					},
					addSessionPatientsDialog: {
						title: "Nomination de clients",
						btn01: "ajouter les clients",
						label01: "à la recherche de clients",
						ph01: "Entrez des mots-clés pour rechercher..."
					},
					ordersCartDialog: {
						text01: "Afficher les demandes",
						text02: "vente à l'intérieur",
						text03: "vente à l'étranger",
						btn01: "envoyer des demandes",
						label01: "Sélectionnez le client ou le patient",
						label02: "le nom de client",
						label03: "le téléphone",
						ph01: "Entrez des mots-clés pour rechercher..."
					},
					orderCartDialog: {
						btn01: "Retour à dos",
						btn02: "Ajouter au panier"
					},
					previewFileDialog: {
						title: "aperçu du fichier"
					}
				},
				addons:{
					userAuth:
					{
						title01: "Créer un compte",
						form01: {
							label01: "Nom de la clinique",
							label02: "Téléphone",
							label03: "Mot de passe",
							label04: "l'état",
							label05: "Municipal",
							label06: "l'adresse",
							label07: "nom du docteur",
							label08: "Nom d'utilisateur",
							submitBTN01: "Créer un compte",
							formText01: "Se connecter"
						},
						title02: "Se connecter",
						form02: {
							label01: "Nom d'utilisateur",
							label02: "Mot de passe",
							label03: "Numéro de téléphone",
							label04: "téléphone",
							submitBTN01: "Se connecter",
							formText01: "création d'un compte"
						},
						select01: {
							option01: "médecin de la clinique",
							option02: "Administration centrale",
							option03: "un patient"
						},
						label01: "Connectez-vous en tant que",
						text01: "Pour vous connecter, suivez ces étapes :",
						text02: "Ouvrez l'appli Clinics sur votre téléphone.",
						text03: "Ouvrez le menu des paramètres.",
						text04: "Choisissez 'Connexion avec QR Code'.",
						text05: "Pointez votre téléphone vers l'écran pour scanner le code QR."
					}
				},
				partials:
				{
					sidebar: {
						nav01: "malades ou clients",
						nav02: "prescriptions médicales",
						nav03: "Réglages",
						nav04: "Vérifier les mises à jour",
						nav05: "Se déconnecter",
						nav06: "Ajouter une ordonnance",
						nav07: "Enregistré",
						nav08: "Enregistrement du patient ou du client",
						nav09: "Ordonnances enregistrées",
						nav10: "Prescriptions médicales affichées",
						nav11: "messages",
						nav12: "Envoi d'un message",
						nav13: "boite de réception",
						nav14: "envoyée",
						nav15: "Sections de traitement",
						nav16: "Ajouter des sections de traitement",
						nav17: "Sections enregistrées",
						nav18: "Rendez-vous",
						nav19: "Ajouter des rendez-vous generale",
						nav20: "Rendez-vous generale enregistrés",
						nav21: "Le magasin",
						nav22: "ajouter des produits",
						nav23: "Visualiser les produits",
						nav24: "Boutique",
						nav25: "Vendez des produits",
						nav26: "Visualiser les produits vendus",
						nav27: "Statistiques",
						nav28: "Trésorerie",
						nav29: "Ajouter ou dépenser du trésor",
						nav30: "Enregistrer l'addition et l'échange du trésor",
						nav31: "des employés",
						nav32: "Ajouter aux centres",
						nav33: "Inscrits dans les centres",
						nav34: "Enregistrement des présences",
						nav35: "Factures en attente d'approbation",
						nav36: "Général",
						nav37: "Général",
						nav38: "les centres",
						nav39: "ajouter un centre",
						nav40: "Ajouter des rendez-vous de suivi",
						nav41: "Comptabilité du personnel",
						nav42: "Ajouter à l'administration centrale",
						nav43: "Inscrit à l'administration centrale",
						nav44: "Vendez des produits",
						nav45: "Centres ou cliniques enregistrés",
						nav46: "Factures des produits envoyés aux centres",
						nav47: "registre comptable",
						nav48: "Déterminer les classes du centre",
						nav49: "Des rendez-vous de suivi enregistrés",
						nav50: "suivi des produits",
						nav51: "Afficher les produits des centres",
						nav52: "Envoi des produits aux centres",
						nav53: "Recettes et accumulation",
						nav54: "Rapports",
						nav55: "Afficher les rapports",
						nav56: "Créer un rapport",
						nav57: "En attente d'approbation (general)",
						nav58: "les publicités",
						nav59: "Créer une publicité",
						nav60: "Annonces enregistrées",
						nav61: "les publicités",
						nav62: "Créez des publicités",
						nav63: "publicités enregistrées",
						nav64: "Enregistré par les publicités",
						nav65: "Ajout ou décaissement de la trésorerie de l'administration centrale",
						nav66: "Ajout ou décaissement de la trésorerie des centres",
						nav67: "Enregistrement d'addition et d'échange de la trésorerie des centres",
						nav68: "Enregistrement d'addition et d'échange de la trésorerie de l'administration centrale",
						nav69: "Administration centrale",
						nav70: "Témoignages",
						nav71: "clips vidéos",
						nav72: "Ajouter des vidéos",
						nav73: "Toutes les vidéos",
						nav74: "En attente d'approbation (en ligne)",
						nav75: "Membres",
						nav76: "Agréé",
						nav77: "Ils ne sont pas agréés",
						nav78: "Boîte de réception (centre)",
						nav79: "Envoyé (centre)",
						nav80: "boîte de réception (privée)",
						nav81: "envoyé (privé)",
						nav82: "clients",
						nav83: "fournisseurs ou exportateurs",
						nav84: "ajouter des fournisseurs",
						nav85: "Voir les inscrits",
						nav86: "Factures des produits saisis",
						text01: "Tous droits réservés par Holoola-z © 2022",
						text02: "Contactez-nous: "
					},
					topNavbar: {
						btn01: "Voir | masquer le menu"
					}
				}
			}
		}

		return LANG;
	}
};

module.exports = Translation;