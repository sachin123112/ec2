#!/usr/bin/env python3
"""
Local build script for the whole project.
Usage examples:
  python scripts/build_local.py --start-postgres
  python scripts/build_local.py --skip-postgres --skip-backend

This script will:
 - Optionally start a Postgres Docker container used by Flyway and services
 - Run Flyway migrations from backend-platform
 - Build backend (Maven)
 - Build frontend (npm + Vite)

Be sure you have: Docker (optional), Java 17+, Maven, Node 18+/npm installed.
"""

import argparse
import shutil
import subprocess
import sys
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIR = os.path.join(ROOT, 'frontend')
BACKEND_DIR = os.path.join(ROOT, 'backend-platform')


def run(cmd, cwd=None, env=None):
    print('\n$ ' + ' '.join(cmd))
    subprocess.run(cmd, cwd=cwd, env=env, check=True)


def check_tool(name):
    path = shutil.which(name)
    return path is not None


def main():
    parser = argparse.ArgumentParser(description='Build whole project locally')
    parser.add_argument('--start-postgres', action='store_true', help='Start a postgres docker container')
    parser.add_argument('--skip-postgres', action='store_true', help='Skip starting postgres')
    parser.add_argument('--skip-backend', action='store_true', help='Skip building backend')
    parser.add_argument('--skip-frontend', action='store_true', help='Skip building frontend')
    parser.add_argument('--no-pull', action='store_true', help='Do not pull docker images')
    args = parser.parse_args()

    try:
        if args.start_postgres and not args.skip_postgres:
            if not check_tool('docker'):
                print('docker is required to start postgres container. Install docker or run with --skip-postgres')
                sys.exit(1)
            image = 'postgres:16'
            if not args.no_pull:
                run(['docker', 'pull', image])
            # Run container (idempotent: remove existing container first)
            run(['docker', 'rm', '-f', 'postgres_ec2'], cwd=ROOT)
            run(['docker', 'run', '-d', '--name', 'postgres_ec2', '-e', 'POSTGRES_USER=postgres', '-e', 'POSTGRES_PASSWORD=postgres123', '-e', 'POSTGRES_DB=ec2_db', '-p', '5432:5432', image], cwd=ROOT)

        # Run Flyway migrations
        if not args.skip_backend:
            if not check_tool('mvn'):
                print('maven (mvn) is required to build backend. Install Maven or run with --skip-backend')
            else:
                run(['mvn', 'org.flywaydb:flyway-maven-plugin:9.16.0:migrate', '-Dflyway.url=jdbc:postgresql://localhost:5432/ec2_db', '-Dflyway.user=postgres', '-Dflyway.password=postgres123'], cwd=BACKEND_DIR)

                # Build backend
                run(['mvn', 'clean', 'package', '-DskipTests'], cwd=BACKEND_DIR)

        # Build frontend
        if not args.skip_frontend:
            if not check_tool('npm'):
                print('npm is required to build frontend. Install Node.js and npm or run with --skip-frontend')
            else:
                run(['npm', 'ci'], cwd=FRONTEND_DIR)
                run(['npm', 'run', 'build'], cwd=FRONTEND_DIR)

        print('\nAll selected steps completed successfully.')

    except subprocess.CalledProcessError as e:
        print('\nCommand failed with exit code', e.returncode)
        sys.exit(e.returncode)


if __name__ == '__main__':
    main()
