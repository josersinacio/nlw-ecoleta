import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import './styles.css';
import logo from '../../assets/logo.svg';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet';
import api, { ibge } from '../../services/api';
import { LeafletMouseEvent } from 'leaflet';
import Dropzone from '../../components/Dropzone';

interface Item {
  id: number,
  title: string, 
  image_url: string
}

interface City {
  id: number,
  name: string
}

interface IBGEUFResponse {
  sigla: string
}

interface IBGECityResponse {
  id: number,
  nome: string
}

const CreatePoint = () => {

  const [items, setItems] = useState<Item[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [ufs, setUFs] = useState<string[]>([]);
  const [initialPosition, setInitialPosition] = useState<[number, number]>([-15.7971163, -47.88533]);
  const [formData, setFormData] = useState<any>({ name: '', email: '', whatsapp: '' });
  
  const [selectedUf, setSelectedUf] = useState('0');
  const [selectedCity, setSelectedCity] = useState('0');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);
  const [selectedFile, setSelectedFile] = useState<File>();

  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.get('items').then(response => {
      setItems(response.data);
    });
  }, []);

  useEffect(() => {
    ibge.get<IBGEUFResponse[]>('localidades/estados').then(response => {
      const ufInitials = response.data.map(uf => uf.sigla);
      setUFs(ufInitials);
    });
  }, []);

  useEffect(() => {
    if (selectedUf === '0') {
      return;
    }

    ibge.get<IBGECityResponse[]>(`localidades/estados/${selectedUf}/municipios`).then(response => {
      const cities = response.data.map(city => ({ id: city.id, name: city.nome }));

      setCities(cities);
    });
  }, [selectedUf]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      setInitialPosition([latitude, longitude]);
    }, console.error);
  }, []);

  function handleSelectUf({ target }: ChangeEvent<HTMLSelectElement>) {
    setSelectedUf(target.value);
  }

  function handleSelectCity({ target }: ChangeEvent<HTMLSelectElement>) {
    setSelectedCity(target.value);
  }

  function handleMapClick({ latlng }: LeafletMouseEvent) {
    setSelectedPosition([latlng.lat, latlng.lng]);
  }

  function handleInputChange({ target }: ChangeEvent<HTMLInputElement>) {
    setFormData({ ...formData, [target.name]: target.value});
  }

  function handleSelectItem(itemId: number) {
    const index = selectedItems.indexOf(itemId);

    if (index === -1) {
      setSelectedItems([...selectedItems, itemId]);
    } else {
      const filteredItems = selectedItems.filter(item => item !== itemId);
      setSelectedItems(filteredItems);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const { name, email, whatsapp } = formData;
    const uf = selectedUf;
    const city = selectedCity;
    const [latitude, longitude] = selectedPosition;
    const items = selectedItems;

    const data = new FormData();

    data.append('name', name);
    data.append('email', email);
    data.append('whatsapp', whatsapp);
    data.append('uf', uf);
    data.append('city', city);
    data.append('latitude', latitude.toString());
    data.append('longitude', longitude.toString());
    data.append('items', items.join(','));

    if (selectedFile) {
      data.append('image', selectedFile);
    }

    await api.post('points', data);

    setSuccess(true);
  }

  return (
    <div id="page-create-point">
      { success && (
          <div id="success-overlay">
            <FiCheckCircle color="#34CB79" size="36px"/>
            <span>&nbsp;</span>
            <span className="anchor">
              <Link to="/">Cadastro Realizado com sucesso!</Link>
            </span>
          </div>
        )        
      }      
      <header>
        <img src={logo} alt="Ecoleta" />

        <Link to="/">
          <FiArrowLeft />
          Votar para home
        </Link>
      </header>

      <form onSubmit={handleSubmit}>
        <h1>Cadastro do <br /> ponto de coleta</h1>  

        <Dropzone onFileUpload={setSelectedFile} />

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>

          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
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
                type="text"
                name="email"
                id="email" 
                onChange={handleInputChange} />
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

          <Map center={initialPosition} zoom={14} onClick={handleMapClick}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors" />

            <Marker position={selectedPosition} />
          </Map>
          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>
              <select onChange={handleSelectUf} name="uf" id="uf">
                <option value="0">Selecione uma UF</option>
                { ufs.map(uf => (
                  <option value={uf} key={uf}>{uf}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select onChange={handleSelectCity} name="city" id="city">
                <option value="0">Selecione uma Cidade</option>
                { cities.map(city => (
                  <option value={city.name} key={city.id}>{city.name}</option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Ítens de coleta</h2>
            <span>Selecione um ou mais ítens abaixo</span>
          </legend>
          <ul className="items-grid">
            { items.map(item => (
                <li 
                  className={ selectedItems.includes(item.id) ? 'selected' : '' } 
                  key={item.id} 
                  onClick={() => handleSelectItem(item.id)}>
                  <img src={item.image_url} alt={item.title} />
                  <span>{item.title}</span>
                </li>
            ))}           
          </ul>
        </fieldset>

        <button type="submit">Cadastrar ponto de coleta</button>
      </form>
    </div>
  );
};

export default CreatePoint /* 1:06 */;