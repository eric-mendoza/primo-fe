"use client";

import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import styles from "./wheel.module.css";
import {IGame} from "@/app/models/Game";

interface WheelProps {
    game: IGame;
    winner: boolean;
    currentPlayer: number | null;
    nextNumber: number;
    play: (number: number) => Promise<{winner: boolean, number: number} | null>;
}


const Wheel: React.FC<WheelProps> = ({ game, winner, currentPlayer, nextNumber , play}) => {
    const chartRef = useRef<SVGSVGElement | null>(null);
    const nextNumberRef = useRef(nextNumber);

    useEffect(() => {
        nextNumberRef.current = nextNumber;
    }, [nextNumber]);

    // Wheel properties
    const padding = { top: 20, right: 40, bottom: 0, left: 0 };
    const w = 700 - padding.left - padding.right;
    const h = 700 - padding.top - padding.bottom;
    const r = Math.min(w, h) / 2;
    let rotation = 0;
    let oldrotation = 0;
    let picked = 100000;
    let oldpick: number[] = [];
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    useEffect(() => {
        drawChart();
    }, [game.numbers]);

    function drawChart() {
        // Remove old svg
        d3.select(chartRef.current).select('svg').remove();

        // Create new svg
        const svg = d3
            .select(chartRef.current)
            .attr("width", w + padding.left + padding.right)
            .attr("height", h + padding.top + padding.bottom)

        const container = svg
            .append("g")
            .attr("class", "chartholder")
            .attr("transform", `translate(${w / 2 + padding.left},${h / 2 + padding.top})`);

        const vis = container.append("g");

        const pieGenerator = d3.
            pie().
            sort(null).
            value(() => 1);

        const arcGenerator = d3
            .arc()
            .innerRadius(0)
            .outerRadius(r);

        const arcs = vis
            .selectAll()
            .data(pieGenerator(game.numbers as any))
            .enter()
            .append("g")
            .attr("class", "slice");

        arcs
            .append("path")
            .attr("d", arcGenerator as any)
            .style("fill", (_d: any, i: any) => color(i))
            .style('stroke', '#ffffff')
            .style('stroke-width', 0);

        arcs
            .append("text")
            .attr("transform", function (d: any) {
                d.innerRadius = 0;
                d.outerRadius = r/1.2;
                d.angle = (d.startAngle + d.endAngle) / 2;
                return `rotate(${(d.angle * 180) / Math.PI - 90})translate(${d.outerRadius - 10})`;
            })
            .attr("text-anchor", "middle")
            .text((_d: any, i: any) => game.numbers[i]);

        async function spin() {
            // Load play values
            let data = await play(game.id);

            let targetNumber =  data?.number || nextNumberRef.current;
            const ps = 360 / game.numbers.length; // Degrees per slice
            const pieslice = Math.round(1440 / game.numbers.length); // The angle for each slice
            const targetIndex = game.numbers.indexOf(targetNumber); // Find the index of the target number

            if (targetIndex === -1) {
                console.error("Target number not found in game.numbers");
                return;
            }

            // Calculate the angle to land on the target number
            const targetRotation = 360 - (targetIndex * ps); // 360 degrees minus the position of the target number

            // Add multiple full spins to the rotation (for visual effect)
            const rng = 1440 + targetRotation; // 4 full spins (360 * 4) plus the target number rotation

            rotation = Math.round(rng / ps) * ps;
            picked = targetIndex;

            rotation += 90 - Math.round(ps / 2); // Adjust final rotation for slice alignment

            vis
                .transition()
                .duration(3000)
                .attrTween("transform", rotTween)
                .on("end", () => {
                    d3.select(`.slice:nth-child(${picked + 1}) path`).attr("fill", "#111");
                    if (data?.winner) {
                        d3.select("#question h1").text("Winner! 🏆");
                    } else {
                        d3.select("#question h1").text("");
                    }
                    oldrotation = rotation;
                    container.on("click", () => spin()); // Rebind click event for future spins
                });
        }
        function rotTween() {
            const i = d3.interpolate(oldrotation % 360, rotation);
            return function (t: number) {
                return `rotate(${i(t)})`;
            };
        }



        container.on("click", spin);

        // Create row which selects the number
        svg
            .append("g")
            .attr("transform", `translate(${w + padding.left + padding.right},${h / 2 + padding.top})`)
            .append("path")
            .attr("d", `M-${r * 0.15},0L0,${r * 0.05}L0,-${r * 0.05}Z`)
            .style("fill", "white");

        // Create circle in the center
        container
            .append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", 60)
            .style("fill", "white")
            .style("cursor", "pointer");

        container
            .append("text")
            .attr("x", 0)
            .attr("y", 15)
            .attr("text-anchor", "middle")
            .text("SPIN")
            .style("font-weight", "bold")
            .style("font-size", "30px");
    }

    return (
        <>
            <svg ref={chartRef} id="chart" className={styles.chart}>
                <g></g>
            </svg>
            <div id="question" className={`text-2xl ${styles.question}`}>
                <h1></h1>
            </div>
        </>
    );
};

export default Wheel;
