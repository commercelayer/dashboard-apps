import type en from "./en"

const it: typeof en = {
  apps: {
    orders: {
      attributes: {
        status: "Stato",
        payment_status: "Stato pagamento",
        fulfillment_status: "Stato spedizione",
      },
      tasks: {
        cart: "Carrello",
        archived: "Archiviati",
        request_return: "Richiedi reso",
        awaiting_customer_review: "In attesa della revisione del cliente",
        rejected_by_customer: "Rifiutato dal cliente",
      },
      details: {
        summary: "Riepilogo",
        to_be_calculated: "Da calcolare",
        shipping: "Spedizione",
        subtotal: "Totale parziale",
        total: "Totale",
        payment_method: "Metodo di pagamento",
        taxes: "Tasse",
        included: "incluse",
        discount: "Sconto",
        use_for_shipping: "Usa per la spedizione",
        use_for_billing: "Usa per la fatturazione",
        new_total_line1:
          "Il nuovo totale è {{new_total}}, {{difference}} in più rispetto al totale originale.",
        new_total_line2: "Modifica il totale per renderlo uguale o inferiore.",
        waiting_for_successful_capture: "In attesa di catturare il pagamento",
        review_reason: "Nota per il cliente",
        review_reason_hint:
          "Cosa hai modificato e perché. Il cliente la legge prima di confermare.",
        review_sent: "Inviato al cliente per revisione.",
        withdraw_review_description:
          "L'ordine non è più in attesa e può essere approvato senza la risposta del cliente.",
      },
      form: {
        language: "Lingua",
        language_hint: "La lingua usata per il checkout",
        error_create_order:
          "Non è possibile creare l'ordine senza un prodotto valido. Selezionane uno.",
        email: "Indirizzo Email",
        email_placeholder: "Cerca o aggiungi un indirizzo email",
        email_hint: "L'indirizzo email del cliente per questo ordine.",
        coupon_code: "Codice coupon",
        select_adjustment_amount:
          "Seleziona un tipo di importo positivo per aumentare il totale dell'ordine.",
        manual_adjustment_name: "Modifica manuale",
      },
      actions: {
        add_item: "Aggiungi prodotto",
        approve: "Approva",
        archive: "Archivia",
        cancel_transactions: "Annulla pagamento",
        cancel: "Annulla ordine",
        capture_payment: "Cattura pagamento",
        capture: "Cattura",
        place: "Piazza ordine",
        refund: "Rimborsa",
        unarchive: "Ripristina",
        continue_editing: "Continua modifiche",
        finish_editing: "Finalizza",
        send_for_review: "Invia al cliente per revisione",
        send_for_review_title: "Inviare l'ordine per revisione?",
        withdraw_review: "Ritira revisione",
        withdraw_review_title: "Ritirare la revisione?",
        adjust_total: "Modifica il totale",
      },
    },
    returns: {
      details: {
        origin: "Magazzino origine",
        destination: "Magazzino destinazione",
        to_destination: "Verso",
      },
    },
  },
}

export default it
