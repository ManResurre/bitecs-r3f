import {Line} from '@react-three/drei';

const BulletLine = ({color = 0xfbf8e6, ...props}) => {
    return <Line
        points={[[0, 0, 0], [0, 0, -1]]} // Начало и конец линии
        color={color}
        lineWidth={1} // Толщина линии в пикселях
        {...props}
    />;
};

export default BulletLine;
