"""
This script finds all of the `run.sh` scripts that exist in the repository and generates GitHub CI
jobs to run all of the scripts as a matrix and check that all of the examples run with no problems.
This means that when new examples or languages are added no changes need to be made to the testing
CI workflow.
"""

from typing import Optional, TypedDict, Any
import yaml
import os


class ExampleInformation(TypedDict):
    category: str
    name: str
    language: str


def main() -> None:
    # Getting the paths
    script_path: str = os.path.dirname(os.path.abspath(__file__))
    root_directory: str = os.path.abspath(os.path.join(script_path, ".."))
    workflow_path: str = os.path.abspath(
        os.path.join(root_directory, ".github", "workflows", "test.yml")
    )

    # Finding all of the `run.sh` scripts that exist
    run_script_paths: list[str] = [
        os.path.join(dirpath, "run.sh")
        for dirpath, _, filenames in os.walk(root_directory)
        if "run.sh" in filenames
    ]

    # Extracting the example information from the path
    example_information: dict[str, ExampleInformation] = {
        entry[0]: entry[1]
        for entry in [
            (path, path_to_example_information(path)) for path in run_script_paths
        ]
        if entry[1] is not None
    }

    # Generating the workflow
    workflow: dict[str, Any] = {
        "name": "Test",
        "on": {"pull_request": {}, "push": {"branches": ["*"]}},
        "jobs": {
            "test-examples": {
                "runs-on": "${{ matrix.examples.runs-on }}",
                "continue-on-error": True,
                "strategy": {
                    "matrix": {
                        "examples": [
                            {
                                "language": example_information["language"],
                                "example-name": example_information["name"],
                                "category": example_information["category"],
                                "script-path": path.replace(root_directory, "."),
                                "runs-on": "macos-latest"
                                if example_information["language"] == "Swift"
                                else "ubuntu-latest",
                            }
                            for path, example_information in example_information.items()
                        ]
                    }
                },
                "name": "Test ${{ matrix.examples.language }}-${{ matrix.examples.category }}-${{ matrix.examples.example-name }}",
                "steps": [
                    {"name": "Checkout", "uses": "actions/checkout@v3"},
                    {
                        "uses": "actions/setup-python@v4",
                        "if": "${{ matrix.examples.language == 'Python' }}",
                        "with": {"python-version": "3.12"},
                    },
                    {
                        "name": "Run Script",
                        "run": "${{ matrix.examples.script-path }}",
                    },
                ],
            }
        },
    }

    with open(workflow_path, "w") as file:
        yaml.dump(workflow, file, sort_keys=False, width=float("inf"))


def path_to_example_information(path: str) -> Optional[ExampleInformation]:
    split: list[str] = path.split(os.sep)
    try:
        language: str = split[-2]
        example_name: str = split[-3]
        category: str = split[-4]

        return {"name": example_name, "language": language, "category": category}
    except:
        return None


if __name__ == "__main__":
    main()
