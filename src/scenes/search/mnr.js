import React from 'react';
import { Row, Col, Container, ButtonGroup, Button } from 'reactstrap';
import { Link } from 'react-router-dom';

import {
    ReactiveBase,
    DataSearch,
    MultiList,
    ReactiveList,
    SelectedFilters,
    ReactiveComponent
} from '@appbaseio/reactivesearch';

import QueryBuilder from './components/queryBuilder';

import ExportComponent from './components/export';

import Mnr from '../../entities/mnr';

import { es_url, bucket_url } from '../../config.js';

const FILTER = ["mainSearch", "prov", "cate", "tech"]

export default class Search extends React.Component {
    constructor(props) {
        super(props);

        const fieldsToExport = [];
        const obj = new Mnr({});
        for (var property in obj) {
            if (obj.hasOwnProperty(property) && property.indexOf('_') !== 0 && typeof (obj[property]) === 'object') {
                fieldsToExport.push(property)
            }
        }

        this.state = {
            normalMode: true,
            fieldsToExport
        }
    }

    renderAdvanced() {
        return (
            <div>
                <QueryBuilder
                    entity={Mnr}
                    componentId="advancedSearch"
                />
                <ReactiveList
                    componentId="results"
                    react={{ and: "advancedSearch" }}
                    onResultStats={(total, took) => { return `${total} résultats trouvés en ${took} ms.` }}
                    URLParams={true}
                    dataField=''
                    size={20}
                    onData={(data) => <Card key={data.REF} data={data} />}
                    pagination={true}
                />
            </div >
        )
    }

    renderNormal() {
        return (
            <div>
                <div className='search-and-export-zone'>
                    <DataSearch
                        componentId="mainSearch"
                        dataField={["REF", "INV", "AUTR", "ATTR", "TITR", "AFFE", "LOCA"]}
                        queryFormat="and"
                        iconPosition="left"
                        className="mainSearch"
                        placeholder="Saisissez un titre, une dénomination, une reference ou une localisation"
                        URLParams={true}
                    />

                    <ReactiveComponent
                        componentId='export'
                        react={{
                            and: FILTER
                        }}
                        defaultQuery={() => ({
                            size: 100,
                            aggs: {},
                        })}
                    >
                        <ExportComponent
                            FILTER={FILTER}
                            filename='mnr.csv'
                            columns={this.state.fieldsToExport}
                        />
                    </ReactiveComponent>
                </div>
                <Row>
                    <Col xs="3">
                        <MultiList
                            componentId="cate"
                            dataField="CATE.keyword"
                            title="Catégorie"
                            className="filters"
                            showSearch={true}
                            URLParams={true}
                            react={{
                                and: FILTER
                            }}
                        />
                        <MultiList
                            componentId="tech"
                            dataField="TECH.keyword"
                            title="Technique"
                            className="filters"
                            showSearch={true}
                            URLParams={true}
                            react={{
                                and: FILTER
                            }}
                        />
                        <MultiList
                            componentId="prov"
                            dataField="PROV.keyword"
                            title="Provenance"
                            className="filters"
                            showSearch={true}
                            URLParams={true}
                            react={{
                                and: FILTER
                            }}
                        />
                    </Col>
                    <Col xs="9">
                        <SelectedFilters />
                        <ReactiveList
                            componentId="results"
                            react={{
                                "and": FILTER
                            }}
                            onResultStats={(total, took) => {
                                return `${total} résultats trouvés en ${took} ms.`
                            }}
                            dataField=''
                            URLParams={true}
                            size={20}
                            onData={(data) => <Card key={data.REF} data={data} />}
                            pagination={true}
                        />
                    </Col>
                </Row>
            </div>
        );
    }

    render() {
        return (
            <Container className='search'>
                <div className='header'>
                    <div className='title'>Rechercher une Notice</div>
                    <div className='buttons'>
                        <ButtonGroup>
                            <Button color="primary" onClick={() => this.setState({ normalMode: !this.state.normalMode })} active={this.state.normalMode}>Recherche normale</Button>
                            <Button color="primary" onClick={() => this.setState({ normalMode: !this.state.normalMode })} active={!this.state.normalMode}>Recherche experte</Button>
                        </ButtonGroup>
                    </div>
                </div>
                <ReactiveBase url={`${es_url}/mnr`} app="mnr" >
                    {this.state.normalMode ? this.renderNormal() : this.renderAdvanced()}
                </ReactiveBase >
            </Container >
        );
    }
}

const Card = ({ data }) => {
    const image = data.VIDEO.length ? `${bucket_url}${data.VIDEO[0]}` : require('../../assets/noimage.jpg');
    return (
        <Link style={{ textDecoration: 'none' }} to={`/notice/mnr/${data.REF}`} className="card" key={data.REF}>
            <img src={image} alt="Lien cassé" />
            <div className='content'>
                <div style={{ display: 'flex' }}><h2>{data.TITR}</h2><span>{data.REF}</span></div>
                <div>
                    <p>{data.DOMN}</p>
                    <p>{data.DENO}</p>
                    <p>{data.LOCA}</p>
                    <p>{data.AUTR}</p>
                </div>
            </div>
        </Link>
    );
}
