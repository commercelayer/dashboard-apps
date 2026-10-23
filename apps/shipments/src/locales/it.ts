import type en from "./en"

const it: typeof en = {
  apps: {
    shipments: {
      attributes: {
        status: "Stato spedizione",
      },
      details: {
        label_already_purchased: "Etichetta già acquistata",
        get_rates_error: "Errore nel recupero delle tariffe",
        purchase_label_error:
          "Errore nell'acquisto dell'etichetta di spedizione. Contatta il tuo corriere.",
        select_rate: "Seleziona una tariffa di spedizione",
        getting_rates: "Recupero tariffe...",
        purchasing: "Acquisto in corso...",
        not_in_packing: "La spedizione non è in stato di imballaggio",
        picking_list: "Lista di prelievo",
        origin: "Magazzino di partenza",
        ship_from: "Partenza da",
        ship_to: "Destinazione",
        weight: "Peso",
      },
      tasks: {
        packing: "Da imballare",
      },
      actions: {
        put_on_hold: "Metti in sospeso",
        start_picking: "Inizia prelievo",
        start_packing: "Inizia imballaggio",
        continue_packing: "Continua imballaggio",
        set_back_to_picking: "Torna in stato prelievo",
        set_ready_to_ship: "Pronto per la spedizione",
        set_shipped: "Segna come spedito",
        set_delivered: "Segna come consegnato",
        purchase_label: "Acquista etichetta",
        purchase_labels: "Acquista etichette",
      },
      form: {
        unit_of_weight: "Unità di peso",
        required_package: "Selezionare un imballo",
        invalid_weight: "Selezionare un peso valido",
        invalid_unit_of_weight: "Selezionare un'unità di peso valida",
        incoterms_rules: "Regole Incoterms",
        select_option: "Seleziona un'opzione",
        delivery_confirmation: "Conferma di consegna",
        require_custom_forms: "Richiedi moduli doganali",
        customs_info_type: "Tipo di merce che stai spedendo",
        content_explanation_hint: "Descrivi brevemente il contenuto del pacco",
        customs_info_failed_delivery_label:
          "Istruzioni in caso di mancata consegna",
        customs_info_restriction_type_label: "Trattamenti speciali richiesti",
        customs_info_customs_signer_label: "Firma doganale",
        customs_info_confirm_checkbox_label:
          "Confermo che le informazioni sono corrette",
        required_custom_form_value:
          "Richiesto quando si specifica un valore del modulo doganale",
        required_if_other_is_selected: 'Richiesto se "Altro" è selezionato',
        required_restriction_comments:
          "Richiesto se si specificano restrizioni doganali",
        customs_info_customs_signer_signature: "Firma",
        customs_info_customs_signer_no_signature: "Nessuna firma",
        customs_info_type_merchandise: "Merce",
        customs_info_type_gift: "Regalo",
        customs_info_type_documents: "Documenti",
        customs_info_type_returned_goods: "Beni restituiti",
        customs_info_type_sample: "Campione",
        customs_info_type_other: "Altro",
        customs_info_failed_delivery_return: "Restituzione",
        customs_info_failed_delivery_abandon: "Abbandono",
        customs_info_restriction_type_none: "Nessuna restrizione",
        customs_info_restriction_type_other: "Altro",
        customs_info_restriction_type_quarantine: "Quarantena",
        customs_info_restriction_type_sanitary_phytosanitary_inspection:
          "Ispezione sanitaria o fitosanitaria",
        no_packages_found: "Nessun imballo trovato in questo magazzino",
        select_package: "Seleziona un imballo",
        packing_items: "Prodotti",
        pack_items: "Imballa elementi · {{items}}",
        more_options: "Altre opzioni",
      },
    },
  },
}

export default it
