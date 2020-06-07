import React, {useEffect , useState, ChangeEvent, FormEvent } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Map, Marker, Popup, TileLayer } from 'react-leaflet';
import api from '../../services/api';
import axios from 'axios';
import { LeafletMouseEvent } from 'leaflet';
import Dropzone from '../../components/dropzone/index'

import './styles.css';

import logo from '../../assets/logo.svg'

interface Item {
  id: number,
  title: string,
  image_url: string
}
interface IBGEUFResponse {
  sigla:string;
};

interface IBGECityResponse {
  nome:string;
};



const CreatePoint = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [ufs, setUFs] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  const [initialPosition, setinitialPosition] = useState<[number,number]>([0,0]);


  const [selectedUf, setSelectedUf] = useState('0');
  const [selectedCity, setSelectedCity] = useState('0');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>(initialPosition);
  const [selectedFile, setSelectedFile] = useState<File>();


  const [formData, setFormData] = useState({
    name:'',
    email: '',
    whatsapp: '',
  });

  useEffect( () => {
    navigator.geolocation.getCurrentPosition( position => {
      const {latitude, longitude} = position.coords
      setinitialPosition([latitude,longitude]);
    });
  },[]);

  useEffect( () => {
    api.get('items').then( response => {
      return setItems(response.data)
    })
  },[]);

  useEffect( () => {
    axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then( response => {
      const ufInitials = response.data.map(uf => uf.sigla)
      setUFs(ufInitials)
    });
  });

  useEffect( () => {
    if(selectedUf === '0'){
      return;
    }
    axios
      .get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
    .then( response => {
      const cityNames = response.data.map( city => city.nome);
      setCities(cityNames)
    })
  },[selectedUf]);

const history = useHistory()


  function handleSelectedUf(event: ChangeEvent<HTMLSelectElement>){
    const uf = event.target.value;
    setSelectedUf(uf);
  };
  function handleSelectedCity(event: ChangeEvent<HTMLSelectElement>){
    const city = event.target.value;
    setSelectedCity(city);
  };

  function handleMapClick(event: LeafletMouseEvent) {
    setSelectedPosition([
      event.latlng.lat,
      event.latlng.lng
    ])

  };

  function handleInputChange( event: ChangeEvent<HTMLInputElement>){
    const { name, value } = event.target;

    setFormData({...formData, [name]: value});
  };

  function handleSelectedItem (id: number) {
    const alreadySelected = selectedItems.findIndex( item => item === id);
    if(alreadySelected >=0 ){
      const filteredItems = selectedItems.filter( item => item !== id);
      setSelectedItems([...filteredItems])
    }else{
      setSelectedItems([...selectedItems,id]);
    }
  };

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const { name, email, whatsapp} = formData;
    const uf = selectedUf;
    const city = selectedCity;
    const [latitude, longitude] = selectedPosition;
    const items = selectedItems;

    const data = new FormData();


      data.append('name',name);
      data.append('email',email);
      data.append('whatsapp',whatsapp);
      data.append('city',city);
      data.append('uf',uf);
      data.append('latitude',String(latitude));
      data.append('longitude',String(longitude));
      data.append('items',items.join(','));

      if(selectedFile){
        data.append('image', selectedFile)
      }
 
    await api.post('points', data)
    alert('Ponto cadastrado com sucesso')
    history.push('/')
  }

    return (
      <div id="page-create-point">
        <header>
          <img src={logo} alt="Ecoleta" />
          <FiArrowLeft />
          <Link to="/">Voltar pra Home</Link>
        </header>
        <form onSubmit={handleSubmit}>
          <h1>
            Cadastro do <br />
            ponto de coleta
          </h1>

          <Dropzone onFileUploaded={setSelectedFile}/>

          <fieldset>
            <legend>
              <h2>Dados</h2>
            </legend>
            <div className="field">
              <label htmlFor="name">Nome da Entidade</label>
              <input 
              type="text" 
              name="name" 
              id="name"
              onChange={handleInputChange} />
            </div>
            <div className="field-group">
              <div className="field">
                <label htmlFor="email">E-mail</label>
                <input 
                  type="email" 
                  name="email" 
                  id="email" 
                  onChange={handleInputChange}/>
              </div>

              <div className="field">
                <label htmlFor="whatsapp">Whatsapp</label>
                <input 
                  type="text" 
                  name="whatsapp" 
                  id="whatsapp"
                  onChange={handleInputChange} />
              </div>
            </div>


          </fieldset>


          <fieldset>
            <legend>
              <h2>Endereço</h2>
              <span>Selecione o endereço no mapa</span>
            </legend>
            <Map center={initialPosition} zoom={15} onClick={handleMapClick}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
              />
              <Marker position={selectedPosition}>
                <Popup>A pretty CSS3 popup.<br />Easily customizable.</Popup>
              </Marker>
            </Map>

            <div className="field-group">
                <div className="field">
                    <label htmlFor="uf">Estado (UF)</label>
                    <select name="uf" id="uf" value={selectedUf} onChange={handleSelectedUf}>
                        <option value="0">Selecione um UF</option>
                        {ufs.sort().map( uf => (
                          <option key={uf} value={uf}>{uf}</option>
                        ))}
                    </select>
                </div>
                <div className="field">
                    <label htmlFor="city">Cidade</label>
                    <select 
                    name="city" 
                    id="city"
                    value = {selectedCity}
                    onChange = {handleSelectedCity}
                    >
                        <option value="0">Selecione uma cidade</option>
                        {cities.map(city => (
                          <option key={city} value={city}>{city}</option>
                        ) )}
                    </select>
                </div>

            </div>
          </fieldset>
          <fieldset>
            <legend>
              <h2>Ítens de coleta</h2>
              <span>Selecione um ou mais itens de coleta</span>
            </legend>
            <ul className="items-grid">
                {items.map( item => (
                    <li 
                    key={item.id} 
                    className = {selectedItems.includes(item.id) ? 'selected' : ''}
                    onClick={() => handleSelectedItem(item.id)}>
                        <img src={item.image_url} alt="teste" />
                        <span>{item.title}</span>
                    </li>
                ))}
                    
            </ul>

          </fieldset>
          <button type="submit">Cadastrar ponto de coleta</button>
        </form>
      </div>
    );
    }

export default CreatePoint