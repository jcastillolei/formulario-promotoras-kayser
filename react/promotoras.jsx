import React, { useState } from 'react'
import { useCssHandles } from 'vtex.css-handles'
import { useQuery } from 'react-apollo'
import QUERY_ORDER from './graphql/collection.gql'
import { useEffect } from 'react'
import axios from 'axios'

import { Modal, Alert } from 'vtex.styleguide'

const CSS_HANDLES = [
  'form_field_string_required_cl_first_name',
  'form_field_string_required_cl_last_name',
  'form_field_string_required_cl_email',
  'form_field_string_required_cl_phone',
  'form_field_string_required_cl_promotora',
  'form_field_submit',

  'label_class',
  'input_class',
  'check_class',
  'btn_subm_class',

  'wrapperLogin',
  'alert_alert_info',
  'alert_alert_warning',
  'alert_alert_success',
  'alert_alert_danger'
]

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};

const VitrinasInteligentes = () => {
  const [newCollection, setnewColection] = useState([])
  const collection = useQuery(QUERY_ORDER)
  const handles = useCssHandles(CSS_HANDLES)
  
  const [showStore, setshowStore] = useState(false)
  const [completState, setcompletState] = useState(false)
  const [exitState, setexitState] = useState(false)
  const [errorState, seterrorState] = useState(false)

  const [aprobado, setAprobado] = useState(false)

  const [modalIsOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setnewColection(collection)
  }, [newCollection])


  const enviarDatosFinal = (event) => {
    event.preventDefault()

    if (cl_first_name.value && cl_last_name.value && cl_email.value && cl_phone.value && cl_promotora.checked == true) {
      validarPromotora(cl_email.value)
      setshowStore(true)
    } else {
      setshowStore(false)
      setcompletState(true)
    }
  }

  //funcionesss

  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  function afterOpenModal() {
    // references are now sync'd and can be accessed.
    subtitle.style.color = '#f00';
  }

  // Event listener
  function validarPromotora(mail) {
    // API Ordenes
    let api_orders = "api/oms/pvt/orders";
    // API Keys
    let api_token = "SMDQGVDFKJGRGJMMWSYNRDVIBQTQZWFGIEEUGAKEBZFOMBRSKMFVJVXPRVPPCNGOEAJCFSGWITMSYGVZZBFMRJWMHPCKKUCOSQKMRPMSFINQJFQLAPQAHTXUDWVQPVLN";
    let api_key = "vtexappkey-kayserltda-WVZKFJ";
    // Correo a consultar
    let email = mail;
    // Fecha desde
    let from = new Date();
    from.setDate(from.getDate() - 3);
    // Fecha hasta
    let to = new Date();
    // Rango de fecha a consultar
    let creationDate = `creationDate:[${from.toISOString()} TO ${to.toISOString()}]`;
    console.log(creationDate);
    // Petición asíncrona
    let isPromo = false;

    const options = {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-VTEX-API-AppToken': api_token,
        'X-VTEX-API-AppKey': api_key,
        'Access-Control-Allow-Origin': '*'
      }
    };
    let url = `/${api_orders}?q=${email}`

    fetch(url, options)
      .then(
        response => response.json()
      ).then(
        (result) => {
          console.log(result)
          let total = 0;
          // Sumar el total de cada pedido
          console.log(result.list);
          result.list.forEach(element => {
            total = total + element.totalValue;
          });
          // Condición de 20.000 o más
          if (total >= 2000000) {
            isPromo = true;

            // Insertar registro dato en bd

            const data = {
              firstName: cl_first_name.value,
              lastName: cl_last_name.value,
              document: cl_phone.value,
              email: cl_email.value,
              promotora: cl_promotora.checked
            }
            insertMasterData(data)

          } else {
            console.log(total);
            isPromo = false;
            
            openModal()
            setshowStore(false)
          }
        },
        (error) => {
          console.log(error)
        }
      )
  }

  function insertMasterData(data) {
    let body = {
      "firstName": data.firstName,
      "lastName": data.lastName,
      "document": data.document,
      "email": data.email,
      "promotora": data.promotora
    }
    body = JSON.stringify(body)

    let api_token = "SMDQGVDFKJGRGJMMWSYNRDVIBQTQZWFGIEEUGAKEBZFOMBRSKMFVJVXPRVPPCNGOEAJCFSGWITMSYGVZZBFMRJWMHPCKKUCOSQKMRPMSFINQJFQLAPQAHTXUDWVQPVLN";
    let api_key = "vtexappkey-kayserltda-WVZKFJ";
    try {
      const resp = axios({
        method: 'POST', url: '/api/dataentities/CL/documents/', data: body,
        headers: { 'Content-Type': 'application/json ', "Accept": "application/json", 'X-VTEX-API-APPTOKEN': api_token, 'X-VTEX-API-AppKey': api_key }
      }).then(function (response) {
        
        console.log(response);
        setexitState(true)
        setshowStore(false)
        seterrorState(false)
      })

    } catch (error) {

      seterrorState(true)
      setshowStore(false)
      setexitState(false)

    }
  }


  return (
    <div className={`${handles.wrapperLogin}`}>
      <div id="contacto">
        <div id="co_message_loading" style={{ display: showStore ? 'block' : 'none' }} className={`${handles.alert_alert_info}`}>
          <Alert type="warning" onClose={() => console.log('Closed!')} action={{ onClick: () =>  setshowStore(false) }}>
            Cargando...
          </Alert>
        </div>
        <div id="co_message_validate" style={{ display: completState ? 'block' : 'none' }} className={`${handles.alert_alert_warning}`}>
          <Alert type="error" onClose={() => console.log('Closed!')} action={{ onClick: () =>  setcompletState(false) }}>
            Complete todos los campos obligatorios del formulario.
          </Alert>
        </div>
        <div id="co_message_success" style={{ display: exitState ? 'block' : 'none' }} className={`${handles.alert_alert_success}`}>
          <Alert type="success" onClose={() => console.log('Closed!')} action={{ onClick: () =>  setexitState(false) }}>
            Se ha enviado con éxito. Ahora puedes <a href="https://promotoras.kaysershop.com/">Iniciar Sesion</a>
          </Alert>
        </div>
        <div id="co_message_error" style={{ display: errorState ? 'block' : 'none' }} className={`${handles.alert_alert_danger}`}>
          <Alert type="error" onClose={() => console.log('Closed!')} action={{ onClick: () =>  seterrorState(false) }}>
            Se ha producido algún error. Por favor, inténtelo de nuevo más tarde.
          </Alert>
        </div>
        <form className={`${handles.eventosForm}`} onSubmit={enviarDatosFinal}>
          <input type="hidden" id="master_data_store_name" name="master_data_store_name" value="kayserpromotoras" />
          <input type="hidden" id="master_data_data_entity" name="master_data_data_entity" value="CO" />
          <div className={`${handles.form_field_string_required_cl_first_name}`}>
            <label className={`${handles.label_class}`} for="cl_first_name">Nombre *</label>
            <input className={`${handles.input_class}`} id="cl_first_name" maxlength="100" name="cl_first_name" type="text" />
          </div>
          <div className={`${handles.form_field_string_required_cl_last_name}`}>
            <label className={`${handles.label_class}`}  for="cl_last_name">Apellido *</label>
            <input className={`${handles.input_class}`} id="cl_last_name" maxlength="100" name="cl_last_name" type="text" />
          </div>
          <div className={`${handles.form_field_string_required_cl_email}`}>
            <label className={`${handles.label_class}`}  for="cl_email">E-mail *</label>
            <input className={`${handles.input_class}`} id="cl_email" maxlength="100" name="cl_email" type="text" />
          </div>
          <div className={`${handles.form_field_string_required_cl_phone}`}>
            <label className={`${handles.label_class}`}  for="cl_phone">Celular</label>
            <input className={`${handles.input_class}`} id="cl_phone" maxlength="100" name="cl_phone" type="text" />
          </div>
          <div className={`${handles.form_field_string_required_cl_promotora}`}>
            <label className={`${handles.label_class}`}  for="cl_promotora">He comprado la cantidad de $20.000 en kaysershop.com</label>
            <input className={`${handles.check_class}`} id="cl_promotora" required="" name="cl_promotora" type="checkbox" />
          </div>
          <div className={`${handles.form_field_submit}`}>
            <input className={`${handles.btn_subm_class}`} id="commit" name="commit" type="submit" value="Enviar" />
          </div>
        </form>

        <Modal
          isOpen={modalIsOpen}
          onClose={closeModal}
          style={customStyles}
        >
          <div className="dark-gray">
            <p>
            Lo sentimos!
            </p>
            <div
              style={{
                backgroundColor: '#edf4fa',
                borderRadius: '4px',
                border: 'solid #368df7',
                borderWidth: '0 0 0 4px',
                boxSizing: 'border-box',
                padding: '12px 16px',
              }}>
              Para calificar como Promotora debes haber comprado la cantidad de $20.000 en KAYSERSHOP.COM.
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}

export default VitrinasInteligentes