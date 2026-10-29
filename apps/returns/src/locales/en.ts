const en = {
  apps: {
    returns: {
      attributes: {
        status: "Status",
      },
      details: {
        origin: "Origin",
        destination: "Destination",
        return_locations: "Return locations",
        delete_error: "Could not cancel this return",
        timeline_requested_return:
          "{{email}} requested the return of {{count}} item",
        timeline_requested_return_other:
          "{{email}} requested the return of {{count}} items",
        timeline_shipped: "Return was <strong>shipped</strong>",
        timeline_received: "Return was <strong>received</strong>",
        timeline_cancelled: "Return was <strong>cancelled</strong>",
        timeline_archived: "Return was <strong>archived</strong>",
        timeline_approved: "Return was <strong>approved</strong>",
        timeline_item_code_restocked:
          "Item {{code}} was <strong>restocked</strong>",
        timeline_payment_of_amount_was_action:
          "Payment of {{amount}} was <strong>{{action}}</strong>",
        timeline_action_of_amount_failed:
          "{{action}} of {{amount}} <strong>failed</strong>",
      },
      form: {
        items: "Items",
        no_items: "No items",
      },
      actions: {
        approve: "Approve",
        reject: "Reject",
        cancel: "Cancel return",
        ship: "Mark shipped",
        receive: "Receive",
        restock: "Restock",
        archive: "Archive",
        unarchive: "Unarchive",
        refund: "Issue a refund",
      },
    },
  },
}

export default en
