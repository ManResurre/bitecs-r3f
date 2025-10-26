import React, {useEffect, useState} from 'react';
import {NavMeshLoader, CostTable, NavMesh} from 'yuka';

// Кастомный хук для загрузки JSON
function useJsonLoader(url: string) {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(url)
            .then(response => response.json())
            .then(json => {
                setData(json);
                setLoading(false);
            })
            .catch(err => {
                setError(err);
                setLoading(false);
            });
    }, [url]);

    return {data, loading, error};
}

interface NavigationMeshProps {
    onNavMeshLoaded: (navMesh: NavMesh) => void
}

const NavigationMesh = ({onNavMeshLoaded}: NavigationMeshProps) => {
    const [navMesh, setNavMesh] = useState(null);
    const [costTable, setCostTable] = useState(null);

    // Загружаем navmesh через NavMeshLoader из Yuka
    useEffect(() => {
        const loader = new NavMeshLoader();

        loader.load('./navmeshes/navmesh.glb')
            .then((loadedNavMesh) => {
                // console.log('NavMesh loaded:', loadedNavMesh);
                setNavMesh(loadedNavMesh);
            })
            .catch((error) => {
                console.error('Failed to load navmesh:', error);
            });
    }, []);

    // Загружаем costTable через кастомный хук
    const {data: costTableData, loading: tableLoading, error: tableError} =
        useJsonLoader('./navmeshes/costTable.json');

    useEffect(() => {
        if (costTableData) {
            const loadedCostTable = new CostTable().fromJSON(costTableData);
            // console.log('CostTable loaded:', loadedCostTable);
            setCostTable(loadedCostTable);
        }
    }, [costTableData]);

    // Когда оба ресурса загружены, можно инициализировать навигацию
    useEffect(() => {
        if (navMesh && costTable) {
            console.log('Both navmesh and cost table are ready');
            // Здесь можно инициализировать NPC, врагов и т.д.
            // Например: this.game.initNavigation(navMesh, costTable);
            onNavMeshLoaded(navMesh)
        }
    }, [navMesh, costTable]);

    return null;
};

export default React.memo(NavigationMesh);
