/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
 define([
  'N/ui/serverWidget', 'N/ui/message',
  'N/search', 'N/record', 'N/runtime', 'N/error', 'N/url',
  './ship_engine_lib'
], (serverWidget, message, search, record, runtime, error, url, ShipEngine) => {

  const CONSTANTS = {
    formTitle: `Auto Create Order and Fulfillment`,
    defaultPackageSublistId: 'package',

    scriptParam: {
      item: 'custscript_order_item',
    },

    customer: {
      countyId: 'custentity2',
    },

    county: {
      type: 'customrecord173',
      field: {
        name: 'custrecord_county_court_name',
        address: 'custrecord_court_street_address',
        city: 'custrecord_court_city',
        state: 'custrecord_court_state',
        county: 'name',
        zipcode: 'custrecord_court_zip',
        phoneNumber: 'custrecord_county_court_phone_number',
      },
    },

    field: {
      shipLabel: 'custbody_auto_shipment_label',
      shipEngineData: 'custbody_ship_engine_data',
    },

    shipToOptions: {
      oasis: 'Oasis',
      client: 'Client',
      judicial: 'Judicial',
    },
  };

  let shippingLabel;

  const getScriptParamValue = name => runtime.getCurrentScript().getParameter({ name });

  class Address {
    static oasisAddress() {
      return {
        name: `Probate Advance, LLC`,
        address_line1: `800 Westchester Ave`,
        address_line2: `Suite N641`,
        city_locality: `Rye Brook`,
        state_province: `NY`,
        postal_code: '10573',
        country_code: 'US',
        phone: `(800) 959-1247`,
        phone_number: `(800) 959-1247`,
      };
    }

    static customerAddress(customerId) {
      const customerLookupResponse = search.lookupFields({
        type: 'customer',
        id: customerId,
        columns: [
          'shipaddress1', 'shipaddress2', 'shipaddressee', 'shipcity',
          'shipcountrycode', 'shipphone', 'shipstate', 'shipzip',
        ]
      });

      return {
        name: customerLookupResponse.shipaddressee,
        address_line1: customerLookupResponse.shipaddress1,
        address_line2: customerLookupResponse.shipaddress2,
        city_locality: customerLookupResponse.shipcity,
        state_province: customerLookupResponse.shipstate,
        postal_code: customerLookupResponse.shipzip,
        country_code: customerLookupResponse.shipcountrycode,
        phone: customerLookupResponse.shipphone,
        phone_number: customerLookupResponse.shipphone,
      };
    }

    static customerJudicialAddress(customerId) {
      const customerLookupResponse = search.lookupFields({
        type: 'customer',
        id: customerId,
        columns: [CONSTANTS.customer.countyId],
      });

      if (!customerLookupResponse[CONSTANTS.customer.countyId]?.[0]?.value) {
        throw error.create({
          name: 'Invalid Request',
          message: `Judicial Address not found on Customer Record with ID: ${customerId}`,
        });
      }

      const countyResults = search.create({
        type: CONSTANTS.county.type,
        filters: [
          ['internalid', 'is', customerLookupResponse[CONSTANTS.customer.countyId][0].value]
        ],
        columns: [
          CONSTANTS.county.field.name,
          CONSTANTS.county.field.address,
          CONSTANTS.county.field.city,
          CONSTANTS.county.field.state,
          CONSTANTS.county.field.county,
          CONSTANTS.county.field.zipcode,
          CONSTANTS.county.field.phoneNumber,
        ],
      }).run().getRange({ start: 0, end: 1 });

      return {
        name: countyResults[0].getValue({ name: CONSTANTS.county.field.name }),
        address_line1: countyResults[0].getValue({ name: CONSTANTS.county.field.address }),
        // address_line2: ,
        city_locality: countyResults[0].getValue({ name: CONSTANTS.county.field.city }),
        state_province: countyResults[0].getValue({ name: CONSTANTS.county.field.state }),
        postal_code: countyResults[0].getValue({ name: CONSTANTS.county.field.zipcode }),
        country_code: `US`,
        phone_number: countyResults[0].getValue({ name: CONSTANTS.county.field.phoneNumber }),
        phone: countyResults[0].getValue({ name: CONSTANTS.county.field.phoneNumber }),
      };
    }
  }

  const updatePackageWeight = ({ fulfillmentId, fulfillmentRecord, shipEngineResponse }) => {
    if (!fulfillmentRecord) {
      fulfillmentRecord = record.load({
        type: 'itemfulfillment',
        id: fulfillmentId,
        // isDynamic: true,
      });

      shipEngineResponse = fulfillmentRecord.getValue({
        fieldId: CONSTANTS.field.shipEngineData
      })

      shipEngineResponse = shipEngineResponse && JSON.parse(shipEngineResponse);
    }

    let trailingId = '';
    let packageSublistId;

    let nsPackageCount = fulfillmentRecord.getLineCount({
      sublistId: CONSTANTS.defaultPackageSublistId
    });

    if (nsPackageCount > 0) {
      log.debug({
        title: `removing packages lines default sublist: ${CONSTANTS.defaultPackageSublistId}, ${nsPackageCount}`,
        details: 'removing package sublist lines'
      });

      for (let lineCount = 0; lineCount < nsPackageCount; lineCount++) {
        fulfillmentRecord.removeLine({
          sublistId: CONSTANTS.defaultPackageSublistId,
          line: lineCount
        });
      }
    }

    nsPackageCount = fulfillmentRecord.getLineCount({
      sublistId: CONSTANTS.defaultPackageSublistId
    });

    if (nsPackageCount === -1) {
      trailingId = 'fedex';
      packageSublistId = CONSTANTS.defaultPackageSublistId + trailingId;
      packageSublistId = packageSublistId.toString();

      nsPackageCount = fulfillmentRecord.getLineCount({
        sublistId: packageSublistId
      });

      if (nsPackageCount === -1) {
        trailingId = 'ups';
        packageSublistId = CONSTANTS.defaultPackageSublistId + trailingId;
        packageSublistId = packageSublistId.toString();

        nsPackageCount = fulfillmentRecord.getLineCount({
          sublistId: packageSublistId
        });
      }
    } else {
      packageSublistId = CONSTANTS.defaultPackageSublistId;
    }

    if (nsPackageCount > 0) {
      log.debug({ title: 'removing packages lines after sublistid change: ' + packageSublistId, details: 'removing package sublist lines' });
      for (let lineCount = 0; lineCount < nsPackageCount; lineCount++) {
        fulfillmentRecord.removeLine({
          sublistId: packageSublistId,
          line: lineCount
        });
      }
    }

    const packageTrackingNumberId = `packagetrackingnumber${trailingId}`;
    let sublistLineCount = fulfillmentRecord.getLineCount({ sublistId: packageSublistId });

    log.debug({
      title: 'package details: ' + fulfillmentRecord.isDynamic,
      details: {
        weight: {
          sublistLineCount,
          packageSublistId,
          fieldId: `packageweight${trailingId}`,
        },
        trackingDetails: {
          sublistId: packageSublistId,
          fieldId: packageTrackingNumberId,
          value: shipEngineResponse.packages[0].tracking_number,
          line: 0,
        }
      }
    });

    for (let line = 0; line < nsPackageCount; line++) {
      log.audit({ title: 'removing packages line noew', details: 'removing package sublist lines' });

      fulfillmentRecord.removeLine({
        sublistId: packageSublistId,
        line,
      })
    }

    if (fulfillmentRecord.isDynamic) {
      fulfillmentRecord.selectNewLine({ sublistId: packageSublistId });

      fulfillmentRecord.setCurrentSublistValue({
        sublistId: packageSublistId,
        fieldId: `packageweight${trailingId}`,
        value: '0.3',
        line: 0,
      });

      fulfillmentRecord.setCurrentSublistValue({
        sublistId: packageSublistId,
        fieldId: packageTrackingNumberId,
        value: shipEngineResponse.tracking_number,
        line: 0,
      });

      fulfillmentRecord.commitLine({ sublistId: packageSublistId });
    } else {
      fulfillmentRecord.setSublistValue({
        sublistId: packageSublistId,
        fieldId: `packageweight${trailingId}`,
        value: '0.3',
        line: 0,
      });

      fulfillmentRecord.setSublistValue({
        sublistId: packageSublistId,
        fieldId: packageTrackingNumberId,
        value: shipEngineResponse.tracking_number,
        line: 0,
      });
    }

    sublistLineCount = fulfillmentRecord.getLineCount({ sublistId: packageSublistId });
    if (sublistLineCount > 1) {
      let toRemoveIndex = sublistLineCount - 1;

      log.debug({ title: 'toRemoveIndex value', details: toRemoveIndex });

      while (toRemoveIndex > 1) {
        log.debug({ title: 'toRemoveIndex', details: toRemoveIndex });
        fulfillmentRecord.removeLine({
          sublistId: packageSublistId,
          line: toRemoveIndex,
        });

        --toRemoveIndex;
      }
    }
  }

  const removetrailingPackageLines = ({ fulfillmentId }) => {
    const fulfillmentRecord = record.load({
      type: 'itemfulfillment',
      id: fulfillmentId,
    });

    let trailingId = '';
    let packageSublistId;

    let nsPackageCount = fulfillmentRecord.getLineCount({
      sublistId: CONSTANTS.defaultPackageSublistId
    });

    if (nsPackageCount > 1) {
      log.debug({
        title: `removing packages lines default sublist: ${CONSTANTS.defaultPackageSublistId}, ${nsPackageCount}`,
        details: 'removing package sublist lines'
      });

      for (let lineCount = 1; lineCount < nsPackageCount; lineCount++) {
        fulfillmentRecord.removeLine({
          sublistId: CONSTANTS.defaultPackageSublistId,
          line: lineCount
        });
      }
    }

    nsPackageCount = fulfillmentRecord.getLineCount({
      sublistId: CONSTANTS.defaultPackageSublistId
    });

    if (nsPackageCount === -1) {
      trailingId = 'fedex';
      packageSublistId = CONSTANTS.defaultPackageSublistId + trailingId;
      packageSublistId = packageSublistId.toString();

      nsPackageCount = fulfillmentRecord.getLineCount({
        sublistId: packageSublistId
      });

      if (nsPackageCount === -1) {
        trailingId = 'ups';
        packageSublistId = CONSTANTS.defaultPackageSublistId + trailingId;
        packageSublistId = packageSublistId.toString();

        nsPackageCount = fulfillmentRecord.getLineCount({
          sublistId: packageSublistId
        });
      }
    } else {
      packageSublistId = CONSTANTS.defaultPackageSublistId;
    }

    if (nsPackageCount > 1) {
      log.debug({ title: 'removing packages lines after sublistid change: ' + packageSublistId, details: 'removing package sublist lines' });
      for (let lineCount = 1; lineCount < nsPackageCount; lineCount++) {
        fulfillmentRecord.removeLine({
          sublistId: packageSublistId,
          line: lineCount
        });
      }
    }

    return fulfillmentRecord.save({ ignoreMandatoryFields: true });
  }

  // #region get-form
  const getListOfShipItem = (shipMethodId) => {
    const filters = [
      ['isinactive', 'is', false],
      'and',
      [
        ['itemid', 'is', 'Fedex Priority Overnight Ship Engine'],
        'or',
        ['itemid', 'is', 'UPS 2nd Day Air A.M.® Ship Engine'],
        'or',
        ['itemid', 'is', 'USPS Priority Mail Flat Rate Envelope Ship Engine']
      ]
    ];

    if (shipMethodId) {
      filters.push(
        'and',
        ['internalid', 'is', shipMethodId]
      );
    }

    const shipItemSearchResults = search.create({
      type: 'shipitem',
      filters,
      columns: ['itemid', 'displayname']
    }).run().getRange({ start: 0, end: 1000 });

    return shipItemSearchResults.map(result => ({
      value: result.id,
      text: result.getValue({ name: 'displayname' }),
    }));
  }

  const getForm = (context) => {
    const form = serverWidget.createForm({ title: CONSTANTS.formTitle });

    let bodyField = form.addField({
      id: 'custpage_customer',
      type: serverWidget.FieldType.SELECT,
      label: 'Customer',
      source: 'customer',
    })
      .setHelpText({
        help: `Select Customer to create order and fulfillment for.`
      })
      .defaultValue = context.request.parameters.custpage_customer;

    bodyField = form.addField({
      id: 'custpage_ship_method',
      type: serverWidget.FieldType.SELECT,
      label: 'Ship Method',
      // source: 'shipitem',
    })
      .setHelpText({
        help: `Select Ship-Method to be used.`
      });

    getListOfShipItem()
      .forEach(shipMethodOption => bodyField.addSelectOption(shipMethodOption));

    bodyField = form.addField({
      id: 'custpage_ship_to',
      type: serverWidget.FieldType.SELECT,
      label: 'Ship To',
    });

    for (const key in CONSTANTS.shipToOptions) {
      bodyField.addSelectOption({
        value: key,
        text: CONSTANTS.shipToOptions[key],
      });
    }

    form.addSubmitButton({
      label: 'Create Order and Fulfillment'
    });

    return form;
  };

  // #endregion get-form

  // #region post-form

  const updateAddressSubrecord = ({ addressRecord, addressMap }) => {
    addressRecord.setValue({
      fieldId: 'addressee',
      value: addressMap.name,
    });

    addressRecord.setValue({
      fieldId: 'addr1',
      value: addressMap.address,
    });

    addressRecord.setValue({
      fieldId: 'addr2',
      value: addressMap.address2,
    });

    addressRecord.setValue({
      fieldId: 'city',
      value: addressMap.city,
    });
    addressRecord.setValue({
      fieldId: 'state',
      value: addressMap.state,
    });
    addressRecord.setValue({
      fieldId: 'zip',
      value: addressMap.zipcode,
    });
    addressRecord.setValue({
      fieldId: 'addrphone',
      value: addressMap.phoneNumber,
    });
  }

  const updateShipToAddress = ({ shipTo, salesOrder, customerId }) => {
    if (shipTo === 'client') {
      return;
    }

    if (shipTo === 'oasis') {
      const shipAddressRecord = salesOrder.getSubrecord({ fieldId: 'shippingaddress' });

      return updateAddressSubrecord({
        addressRecord: shipAddressRecord,
        addressMap: {
          name: `Probate Advance LLC`,
          address: `800 Westchester Ave`,
          city: `Rye Brook`,
          state: `NY`,
          zipcode: `10573`,
          phoneNumber: '8009591247',
        },
      });
    }

    // fetch judicial address from customer and set it on SO
    const judicialAddressMap = Address.customerJudicialAddress(customerId)

    const shipAddressRecord = salesOrder.getSubrecord({ fieldId: 'shippingaddress' });

    return updateAddressSubrecord({
      addressRecord: shipAddressRecord,
      addressMap: judicialAddressMap,
    });
  }

  /**
   *
   * @param {Object}          param0
   * @prop  {String}          customerId
   * @prop  {String | Number} shipMethod
   * @prop  {String}          shipTo
   *
   * @returns {String}
   */
   const createSo = ({ customerId, shipMethod, shipTo }) => {
    const salesOrder = record.create({
      type: 'salesorder',
      isDynamic: true,
    });

    salesOrder.setValue({
      fieldId: 'entity',
      value: customerId,
    });

    salesOrder.setValue({
      fieldId: 'shipcarrier',
      value: 'nonups',
    });

    salesOrder.setValue({
      fieldId: 'shipmethod',
      value: shipMethod,
    });

    // add shipToAddress
    updateShipToAddress({
      shipTo,
      salesOrder,
      customerId
    });

    log.audit({ title: 'item', details: getScriptParamValue(CONSTANTS.scriptParam.item) });

    // add line item
    salesOrder.selectNewLine({ sublistId: 'item' });
    salesOrder.setCurrentSublistValue({
      sublistId: 'item',
      fieldId: 'item',
      value: getScriptParamValue(CONSTANTS.scriptParam.item)
    });

    salesOrder.setCurrentSublistValue({
      sublistId: 'item',
      fieldId: 'quantity',
      value: 1
    });

    salesOrder.setCurrentSublistValue({
      sublistId: 'item',
      fieldId: 'rate',
      value: 0
    });

    salesOrder.commitLine({ sublistId: 'item' });

    // set order state to Pending-Fulfillment/Approved
    salesOrder.setValue({
      fieldId: 'orderstatus',
      value: 'B',
    });

    return salesOrder.save({ ignoreMandatoryFields: true });
  }

  /**
   *
   * @param {Object} param0
   * @prop  {String} param0.soId
   * @returns
   */
  const fulfillOrder = ({ soId, customerId, shipMethod, shipTo }) => {
    const fulfillmentRecord = record.transform({
      fromType: 'salesorder',
      fromId: soId,
      toType: 'itemfulfillment',
    });

    fulfillmentRecord.setValue({
      fieldId: 'shipstatus',
      value: 'B',
    });

    const shipEngineResponse = generateShippingLabel({
      shipTo,
      shipMethod,
      customerId,
      fulfillmentRecord
    });

    updatePackageWeight({ shipEngineResponse, fulfillmentRecord });

    return fulfillmentRecord.save({ ignoreMandatoryFields: true });
  }

  const generateShippingLabel = ({ customerId, fulfillmentRecord, shipMethod, shipTo }) => {
    let shipToAddress;
    let shipFromAddress;

    if (shipTo === 'oasis') {
      shipToAddress = Address.oasisAddress();

      shipFromAddress = Address.customerAddress(customerId);
    } else if (shipTo === 'client') {
      shipToAddress = Address.customerAddress(customerId);;
      shipFromAddress = Address.oasisAddress();
    } else {
      shipToAddress = Address.customerJudicialAddress(customerId);;
      shipFromAddress = Address.oasisAddress();
    }

    const packages = [{
      weight: {
        value: 0.3,
        unit: 'pound',
      },
    }];

    const shipItem = getListOfShipItem(shipMethod);

    let shipCarrier = `ups`;
    if (shipItem[0].text.indexOf(`Fedex Priority Overnight`) > -1) {
      shipCarrier = 'fedex';
    } else if (shipItem[0].text.indexOf(`USPS Priority Mail Flat Rate Envelope`) > -1) {
      shipCarrier = 'usps';
    }

    log.audit({
      title: 'ship-engine data',
      details: {
        shipTo: shipToAddress,
        shipFrom: shipFromAddress,
        packages,
        shipCarrier,
      }
    });


    const shipEngineObj = new ShipEngine({
      shipTo: shipToAddress,
      shipFrom: shipFromAddress,
      packages,
      shipCarrier,
    });

    const shipEngineResponse = shipEngineObj.printShippingLabel();

    const respBody = JSON.parse(shipEngineResponse.body);

    if (shipEngineResponse.code != 200) {
      throw error.create({
        name: 'SHIP_ENGINE_ERROR_PRINTING_LABEL',
        message: `Error occurred while printing label. Error: ${respBody.errors.map(er => er.message).join(';')}`,
      });
    }

    fulfillmentRecord.setValue({
      fieldId: CONSTANTS.field.shipEngineData,
      value: JSON.stringify(respBody),
    });

    fulfillmentRecord.setValue({
      fieldId: CONSTANTS.field.shipLabel,
      value: respBody.label_download.pdf,
    });

    shippingLabel = respBody.label_download.pdf;

    return respBody;
  };

  const postForm = ({
    request: {
      parameters: {
        custpage_ship_to: shipTo,
        custpage_customer: customerId,
        custpage_ship_method: shipMethod,
      },
    },
    response,
  }) => {
    const soId = createSo({ customerId, shipMethod, shipTo });

    log.audit({ title: 'SO created', details: soId });

    const fulfillmentId = fulfillOrder({
      soId,
      shipTo,
      customerId,
      shipMethod,
    });

    removetrailingPackageLines({ fulfillmentId });

    log.audit({ title: 'fulfillment created', details: fulfillmentId });

    const form = serverWidget.createForm({ title: CONSTANTS.formTitle });

    form.addPageInitMessage({
      type: message.Type.INFORMATION,
      title: 'Success',
      message: `Order and Fulfillment created successfully!`,
    });

    const fulfillmentLookup = search.lookupFields({
      type: 'itemfulfillment',
      id: fulfillmentId,
      columns: ['createdfrom', 'transactionnumber']
    });

    const soUrl = url.resolveRecord({
      isEditMode: false,
      recordId: soId,
      recordType: 'salesorder',
    });

    const fulfillmentUrl = url.resolveRecord({
      isEditMode: false,
      recordId: fulfillmentId,
      recordType: 'itemfulfillment',
    });

    form.addField({
      id: 'custpage_inline_html',
      type: serverWidget.FieldType.INLINEHTML,
      label: 'Inline HTML',
    })
      .defaultValue = `
        <span style="font-size: 1.5rem;">Sales Order and Item fulfillment records created</span><br/><br/>
        <span style="font-size: 0.9rem;">
          <strong>Sales Order:</strong> <a href='${soUrl}'>${fulfillmentLookup.createdfrom[0].text}</a><br/>
          <strong>Item Fulfillment:</strong> <a href='${fulfillmentUrl}''>${fulfillmentLookup.transactionnumber}</a>
        </span><br/>
        <span style="font-size: 1rem;">
          If your shipping label is not automatically downloaded, click <a href='${shippingLabel}' target='_blank'>here</a> to download it manually.
        <script>
        window.open('${shippingLabel}', '_blank');
        </script>
        </span>
      `;

    return response.writePage(form);
  }

  const onRequest = context => {
    const response = context.response;

    try {
      const method = context.request.method;

      if (method === 'GET') {
        return response.writePage(getForm(context));
      }

      return postForm(context);
    } catch (e) {
      log.error({ title: 'Suitelet Error', details: e.message });
      log.error({ title: 'Suitelet Stack', details: e.stack });

      const form = serverWidget.createForm({ title: CONSTANTS.formTitle });

      form.addPageInitMessage({
        type: message.Type.ERROR,
        title: 'Error Occurred while Processing Request',
        message: e.message,
      });

      return response.writePage(form);
    }
  };

  return { onRequest };
});
