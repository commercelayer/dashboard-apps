const en = {
  apps: {
    customers: {
      attributes: {
        status: "Status",
      },
      details: {
        registered: "Registered",
        guest: "Guest",
        newsletter: "Newsletter",
        subscribed: "Subscribed",
        type: "Type",
        wallet: "Wallet",
        groups: "Groups",
      },
      anonymize: {
        title: "Customer cannot be deleted",
        description:
          "Their personal data will be replaced everywhere, including orders. You can cancel the request until it starts.",
        request_button: "Request anonymization",
      },
      anonymization_info: {
        alert_requested:
          "Customer anonymization requested by {{requestedby}} on {{requestedat}}. You can cancel this request until it is processed.",
        alert_in_progress:
          "Customer anonymization in progress. Requested by {{requestedby}} on {{requestedat}}.",
        alert_completed:
          "Customer anonymization completed on {{completedat}}. Requested by {{requestedby}} on {{requestedat}}.",
        cancel_button: "Cancel request",
      },
      form: {
        customer_group_label: "Group",
        customer_group_hint: "The group to which this customer belongs",
        email_hint: "The customer's email address",
      },
    },
  },
}

export default en
